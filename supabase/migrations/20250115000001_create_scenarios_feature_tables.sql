-- Migration: Create Scenarios Feature Tables
-- This migration creates the database schema for the comprehensive Scenarios feature
-- that allows users to experiment with copies of instances safely

-- Enable the scenarios feature flag
INSERT INTO feature_flags (flag_name, enabled, description) 
VALUES ('feature:scenarios', true, 'Enable comprehensive scenarios feature for instance experimentation')
ON CONFLICT (flag_name) DO UPDATE SET enabled = true;

-- Create scenarios table (enhanced version of existing)
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Scenario metadata
  is_primary BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]',
  
  -- Scenario settings (stored as JSON for flexibility)
  settings JSONB DEFAULT '{}',
  
  -- Aggregated projections data (cached for performance)
  aggregated_projections JSONB DEFAULT '[]',
  last_calculated_at TIMESTAMP WITH TIME ZONE
);

-- Create scenario_instances table (copies of real instances)
CREATE TABLE IF NOT EXISTS scenario_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE NOT NULL,
  
  -- Reference to original instance (if copied from existing)
  original_instance_id UUID REFERENCES instances(id) ON DELETE SET NULL,
  
  -- Instance data (full copy of instance data at time of creation)
  instance_data JSONB NOT NULL,
  
  -- Scenario-specific overrides
  overrides JSONB DEFAULT '{}',
  
  -- Status tracking
  status TEXT CHECK (status IN ('draft', 'active', 'synced', 'conflict')) DEFAULT 'draft',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Instance name in scenario context
  scenario_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

-- Create scenario_applications table (track apply operations)
CREATE TABLE IF NOT EXISTS scenario_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE NOT NULL,
  scenario_instance_id UUID REFERENCES scenario_instances(id) ON DELETE CASCADE NOT NULL,
  
  -- Apply operation details
  operation_type TEXT CHECK (operation_type IN ('create', 'update')) NOT NULL,
  target_instance_id UUID REFERENCES instances(id) ON DELETE CASCADE, -- NULL for create operations
  
  -- Apply status
  status TEXT CHECK (status IN ('pending', 'applying', 'success', 'failed', 'conflict')) DEFAULT 'pending',
  
  -- Conflict resolution
  conflict_data JSONB DEFAULT '{}',
  resolution_strategy TEXT CHECK (resolution_strategy IN ('overwrite', 'merge', 'skip')) DEFAULT 'overwrite',
  
  -- Timestamps
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Create feature_flags table if it doesn't exist
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX idx_scenarios_status ON scenarios(status);
CREATE INDEX idx_scenarios_created_at ON scenarios(created_at);
CREATE INDEX idx_scenarios_is_primary ON scenarios(is_primary) WHERE is_primary = true;

CREATE INDEX idx_scenario_instances_scenario_id ON scenario_instances(scenario_id);
CREATE INDEX idx_scenario_instances_original_instance_id ON scenario_instances(original_instance_id);
CREATE INDEX idx_scenario_instances_status ON scenario_instances(status);
CREATE INDEX idx_scenario_instances_display_order ON scenario_instances(scenario_id, display_order);

CREATE INDEX idx_scenario_applications_scenario_id ON scenario_applications(scenario_id);
CREATE INDEX idx_scenario_applications_status ON scenario_applications(status);
CREATE INDEX idx_scenario_applications_created_at ON scenario_applications(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scenarios
CREATE POLICY "Users can view their own scenarios" ON scenarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scenarios" ON scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios" ON scenarios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios" ON scenarios
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for scenario_instances
CREATE POLICY "Users can view scenario instances for their scenarios" ON scenario_instances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scenarios 
      WHERE scenarios.id = scenario_instances.scenario_id 
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scenario instances for their scenarios" ON scenario_instances
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenarios 
      WHERE scenarios.id = scenario_instances.scenario_id 
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scenario instances for their scenarios" ON scenario_instances
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM scenarios 
      WHERE scenarios.id = scenario_instances.scenario_id 
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scenario instances for their scenarios" ON scenario_instances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM scenarios 
      WHERE scenarios.id = scenario_instances.scenario_id 
      AND scenarios.user_id = auth.uid()
    )
  );

-- Create RLS policies for scenario_applications
CREATE POLICY "Users can view scenario applications for their scenarios" ON scenario_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scenarios 
      WHERE scenarios.id = scenario_applications.scenario_id 
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scenario applications for their scenarios" ON scenario_applications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM scenarios 
      WHERE scenarios.id = scenario_applications.scenario_id 
      AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scenario applications for their scenarios" ON scenario_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM scenarios 
      WHERE scenarios.id = scenario_applications.scenario_id 
      AND scenarios.user_id = auth.uid()
    )
  );

-- Create RLS policies for feature_flags (admin only for now)
CREATE POLICY "Users can view feature flags" ON feature_flags
  FOR SELECT USING (true);

-- Create functions to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_scenarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_scenario_instances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_scenarios_updated_at();

CREATE TRIGGER update_scenario_instances_updated_at
  BEFORE UPDATE ON scenario_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_scenario_instances_updated_at();

-- Create function to ensure only one primary scenario per user
CREATE OR REPLACE FUNCTION ensure_single_primary_scenario()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a scenario as primary, unset all others for this user
  IF NEW.is_primary = true THEN
    UPDATE scenarios 
    SET is_primary = false 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_scenario
  BEFORE INSERT OR UPDATE ON scenarios
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_scenario();

-- Create function to check feature flag
CREATE OR REPLACE FUNCTION is_feature_enabled(flag_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM feature_flags 
    WHERE feature_flags.flag_name = is_feature_enabled.flag_name 
    AND enabled = true
  );
END;
$$ LANGUAGE plpgsql;

-- Insert default feature flags
INSERT INTO feature_flags (flag_name, enabled, description) VALUES
  ('feature:scenarios', true, 'Enable comprehensive scenarios feature'),
  ('feature:scenarios:apply', true, 'Enable apply functionality for scenarios'),
  ('feature:scenarios:conflict_resolution', true, 'Enable conflict resolution for scenario applications')
ON CONFLICT (flag_name) DO NOTHING;
