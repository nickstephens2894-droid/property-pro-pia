# Funding Details Feature - Implementation Plan

## Executive Summary

This document provides a comprehensive implementation plan for adding a Funding Details feature to the Property Investment Analysis (PIA) application. The feature will allow users to add multiple funding sources (loan funds and cash funds) to property investment instances, with real-time balance tracking and constraint enforcement.

## 1. Current System Analysis

### 1.1 Existing Architecture

**Frontend Stack:**

- React 18 with TypeScript
- Vite build system
- Tailwind CSS for styling
- Shadcn/ui component library
- React Router for navigation
- Context-based state management

**Backend Stack:**

- Supabase (PostgreSQL + Auth + RLS)
- Row Level Security (RLS) for data isolation
- Real-time subscriptions via Supabase client

**Key Components Identified:**

- `src/pages/Funds.tsx` - Main funds management UI
- `src/hooks/useLoanFunds.ts` - Loan funds data management
- `src/components/EditInvestorDialog.tsx` - Reusable dialog pattern
- `src/pages/AddInstance.tsx` - Instance creation flow
- `src/pages/InstanceDetail.tsx` - Instance editing flow

### 1.2 Current Funding System

**Existing Tables:**

- `loan_funds` - Stores loan fund configurations
- `instances` - Property investment instances
- `investors` - Investor profiles

**Current Limitations:**

- No relationship between instances and funds
- No tracking of fund usage/availability
- No multi-funding support per instance
- Cash funds not implemented (placeholder only)

## 2. Data Model Changes

### 2.1 New Database Tables

#### 2.1.1 `instance_fundings` Table

```sql
CREATE TABLE public.instance_fundings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  fund_id UUID NOT NULL REFERENCES loan_funds(id) ON DELETE CASCADE,
  fund_type TEXT NOT NULL CHECK (fund_type IN ('loan', 'cash')),
  amount_allocated DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_used DECIMAL(12,2) NOT NULL DEFAULT 0,
  allocation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(instance_id, fund_id)
);
```

#### 2.1.2 `cash_funds` Table

```sql
CREATE TABLE public.cash_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  fund_type TEXT NOT NULL DEFAULT 'Savings',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  available_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  return_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.2 Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_instance_fundings_instance_id ON instance_fundings(instance_id);
CREATE INDEX idx_instance_fundings_fund_id ON instance_fundings(fund_id);
CREATE INDEX idx_cash_funds_owner_user_id ON cash_funds(owner_user_id);

-- Composite indexes for queries
CREATE INDEX idx_instance_fundings_instance_fund ON instance_fundings(instance_id, fund_id);
```

### 2.3 Row Level Security (RLS) Policies

```sql
-- instance_fundings RLS
ALTER TABLE instance_fundings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage instance_fundings via instance ownership" ON instance_fundings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM instances i
      WHERE i.id = instance_fundings.instance_id AND i.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM instances i
      WHERE i.id = instance_fundings.instance_id AND i.user_id = auth.uid()
    )
  );

-- cash_funds RLS
ALTER TABLE cash_funds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own cash funds" ON cash_funds
  FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);
```

### 2.4 Database Functions

#### 2.4.1 Fund Availability Check Function

```sql
CREATE OR REPLACE FUNCTION check_fund_availability(
  p_fund_id UUID,
  p_fund_type TEXT,
  p_amount DECIMAL(12,2)
) RETURNS BOOLEAN AS $$
DECLARE
  available_amount DECIMAL(12,2);
BEGIN
  IF p_fund_type = 'loan' THEN
    SELECT (fund_amount - COALESCE(SUM(amount_used), 0))
    INTO available_amount
    FROM loan_funds lf
    LEFT JOIN instance_fundings if ON lf.id = if.fund_id
    WHERE lf.id = p_fund_id
    GROUP BY lf.id, lf.fund_amount;
  ELSE
    SELECT (total_amount - COALESCE(SUM(amount_used), 0))
    INTO available_amount
    FROM cash_funds cf
    LEFT JOIN instance_fundings if ON cf.id = if.fund_id
    WHERE cf.id = p_fund_id
    GROUP BY cf.id, cf.total_amount;
  END IF;

  RETURN COALESCE(available_amount, 0) >= p_amount;
END;
$$ LANGUAGE plpgsql;
```

#### 2.4.2 Update Fund Usage Function

```sql
CREATE OR REPLACE FUNCTION update_fund_usage(
  p_fund_id UUID,
  p_fund_type TEXT,
  p_amount_used DECIMAL(12,2)
) RETURNS VOID AS $$
BEGIN
  UPDATE instance_fundings
  SET amount_used = p_amount_used,
      updated_at = now()
  WHERE fund_id = p_fund_id;
END;
$$ LANGUAGE plpgsql;
```

## 3. API Contract Changes

### 3.1 New Service: `useInstanceFundings.ts`

```typescript
// src/hooks/useInstanceFundings.ts
export interface InstanceFunding {
  id: string;
  instance_id: string;
  fund_id: string;
  fund_type: "loan" | "cash";
  amount_allocated: number;
  amount_used: number;
  allocation_date: string;
  notes?: string;
  fund_name?: string; // Joined from fund tables
  fund_available_amount?: number; // Calculated
}

export interface CreateInstanceFundingRequest {
  instance_id: string;
  fund_id: string;
  fund_type: "loan" | "cash";
  amount_allocated: number;
  notes?: string;
}

export function useInstanceFundings(instanceId?: string) {
  // CRUD operations for instance fundings
  // Real-time updates via Supabase subscriptions
  // Fund availability checking
  // Optimistic UI updates
}
```

### 3.2 Enhanced Service: `useCashFunds.ts`

```typescript
// src/hooks/useCashFunds.ts
export interface CashFund {
  id: string;
  name: string;
  fund_type: string;
  total_amount: number;
  available_amount: number;
  return_rate: number;
  created_at: string;
  updated_at: string;
}

export function useCashFunds() {
  // CRUD operations for cash funds
  // Available amount calculation
  // Real-time balance updates
}
```

### 3.3 Enhanced Service: `useLoanFunds.ts`

```typescript
// Enhanced existing useLoanFunds.ts
export interface LoanFundWithUsage extends LoanFund {
  available_amount: number;
  used_amount: number;
  usage_percentage: number;
}

export function useLoanFunds() {
  // Existing functionality +
  // Available amount calculation
  // Usage tracking per instance
  // Real-time balance updates
}
```

## 4. Frontend Component Plan

### 4.1 New Components

#### 4.1.1 `AddFundingDialog.tsx`

**Location:** `src/components/AddFundingDialog.tsx`
**Purpose:** Reusable dialog for adding funding to instances
**Pattern:** Mirror `EditInvestorDialog.tsx` structure

```typescript
interface AddFundingDialogProps {
  instanceId: string;
  onFundingAdded: (funding: InstanceFunding) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Features:**

- Tabbed interface for Loan Funds vs Cash Funds
- Fund selection with availability display
- Amount input with validation
- Real-time availability checking
- Notes field

#### 4.1.2 `FundingCard.tsx`

**Location:** `src/components/FundingCard.tsx`
**Purpose:** Display individual funding allocation in instance UI

```typescript
interface FundingCardProps {
  funding: InstanceFunding;
  onEdit: (funding: InstanceFunding) => void;
  onRemove: (fundingId: string) => void;
  onUpdateAmount: (fundingId: string, amount: number) => void;
}
```

**Features:**

- Fund name and type display
- Allocated vs used amount
- Progress bar for usage
- Edit/remove actions
- Real-time updates

#### 4.1.3 `FundingSummaryPanel.tsx`

**Location:** `src/components/FundingSummaryPanel.tsx`
**Purpose:** Summary of all funding for an instance

```typescript
interface FundingSummaryPanelProps {
  instanceId: string;
  fundings: InstanceFunding[];
  totalRequired: number;
  totalAllocated: number;
  totalUsed: number;
}
```

**Features:**

- Total funding overview
- Shortfall/surplus indicators
- Fund utilization charts
- Quick add funding button

### 4.2 Enhanced Components

#### 4.2.1 `InstanceDetail.tsx`

**Changes:**

- Add "Funding" tab to existing tabs
- Integrate `FundingSummaryPanel`
- Add "Add Funding" button
- Display funding cards in funding tab

#### 4.2.2 `AddInstance.tsx`

**Changes:**

- Add funding step to instance creation flow
- Optional funding allocation during creation
- Integration with existing form validation

#### 4.2.3 `Funds.tsx`

**Changes:**

- Implement cash funds tab (currently placeholder)
- Add usage tracking to loan fund cards
- Show instances using each fund
- Add "Used by X instances" information

### 4.3 State Management

#### 4.3.1 Context Updates

**File:** `src/contexts/InstancesContext.tsx`
**Changes:**

- Add funding-related state
- Add funding CRUD operations
- Real-time funding updates

#### 4.3.2 New Context: `FundingContext.tsx`

**Location:** `src/contexts/FundingContext.tsx`
**Purpose:** Centralized funding state management

```typescript
interface FundingContextType {
  // Instance fundings
  instanceFundings: InstanceFunding[];
  addInstanceFunding: (funding: CreateInstanceFundingRequest) => Promise<void>;
  updateInstanceFunding: (
    id: string,
    updates: Partial<InstanceFunding>
  ) => Promise<void>;
  removeInstanceFunding: (id: string) => Promise<void>;

  // Fund availability
  checkFundAvailability: (
    fundId: string,
    fundType: "loan" | "cash",
    amount: number
  ) => Promise<boolean>;

  // Real-time updates
  subscribeToFundingUpdates: (instanceId: string) => void;
  unsubscribeFromFundingUpdates: () => void;
}
```

## 5. Concurrency & Correctness Strategy

### 5.1 Database Constraints

#### 5.1.1 Fund Availability Validation

```sql
-- Trigger to validate fund availability before allocation
CREATE OR REPLACE FUNCTION validate_fund_allocation()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT check_fund_availability(NEW.fund_id, NEW.fund_type, NEW.amount_allocated) THEN
    RAISE EXCEPTION 'Insufficient fund availability for allocation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_fund_allocation
  BEFORE INSERT OR UPDATE ON instance_fundings
  FOR EACH ROW EXECUTE FUNCTION validate_fund_allocation();
```

#### 5.1.2 Atomic Fund Updates

```sql
-- Function for atomic fund allocation
CREATE OR REPLACE FUNCTION allocate_fund_to_instance(
  p_instance_id UUID,
  p_fund_id UUID,
  p_fund_type TEXT,
  p_amount DECIMAL(12,2),
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  funding_id UUID;
BEGIN
  -- Check availability
  IF NOT check_fund_availability(p_fund_id, p_fund_type, p_amount) THEN
    RAISE EXCEPTION 'Insufficient fund availability';
  END IF;

  -- Insert allocation
  INSERT INTO instance_fundings (instance_id, fund_id, fund_type, amount_allocated, notes)
  VALUES (p_instance_id, p_fund_id, p_fund_type, p_amount, p_notes)
  RETURNING id INTO funding_id;

  RETURN funding_id;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 Client-Side Validation

#### 5.2.1 Optimistic UI Updates

```typescript
// Optimistic update pattern
const addFundingOptimistic = async (funding: CreateInstanceFundingRequest) => {
  // 1. Optimistic update
  const optimisticFunding = {
    ...funding,
    id: generateId(),
    amount_used: 0,
    allocation_date: new Date().toISOString(),
    fund_name: getFundName(funding.fund_id),
    fund_available_amount: getFundAvailableAmount(funding.fund_id),
  };

  setInstanceFundings((prev) => [...prev, optimisticFunding]);

  try {
    // 2. Server update
    const actualFunding = await addInstanceFunding(funding);

    // 3. Replace optimistic with actual
    setInstanceFundings((prev) =>
      prev.map((f) => (f.id === optimisticFunding.id ? actualFunding : f))
    );
  } catch (error) {
    // 4. Rollback on error
    setInstanceFundings((prev) =>
      prev.filter((f) => f.id !== optimisticFunding.id)
    );
    throw error;
  }
};
```

#### 5.2.2 Real-time Conflict Resolution

```typescript
// Real-time subscription for fund updates
useEffect(() => {
  const subscription = supabase
    .channel("funding-updates")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "instance_fundings",
        filter: `instance_id=eq.${instanceId}`,
      },
      (payload) => {
        // Handle real-time updates
        handleFundingUpdate(payload);
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [instanceId]);
```

### 5.3 Server-Side Validation

#### 5.3.1 Fund Availability Checks

- Server-side validation before any fund allocation
- Atomic transactions for fund updates
- Row-level locking for concurrent access
- Retry logic for failed allocations

#### 5.3.2 Idempotency

- Unique constraints on (instance_id, fund_id)
- Idempotent API endpoints
- Request deduplication on client side

## 6. UX Details & Edge Cases

### 6.1 Validation Messages

#### 6.1.1 Fund Availability

- "Fund has insufficient available balance"
- "Fund is fully allocated to other instances"
- "Amount exceeds fund's available capacity"

#### 6.1.2 Amount Validation

- "Amount must be greater than 0"
- "Amount cannot exceed fund's available balance"
- "Total allocation cannot exceed project cost"

### 6.2 Max/Min Amounts

#### 6.2.1 Minimum Amounts

- Minimum allocation: $1,000
- Minimum fund balance: $10,000

#### 6.2.2 Maximum Amounts

- Maximum allocation per fund: 100% of available balance
- Maximum total allocation: 120% of project cost (buffer for overruns)

### 6.3 Partial Failures

#### 6.3.1 Network Failures

- Retry mechanism with exponential backoff
- Offline queue for pending allocations
- Clear error messages with retry options

#### 6.3.2 Validation Failures

- Real-time validation feedback
- Clear error messages with suggestions
- Graceful degradation of features

### 6.4 Multi-Tab Handling

#### 6.4.1 Real-time Synchronization

- Supabase real-time subscriptions
- Cross-tab state synchronization
- Conflict resolution for simultaneous edits

#### 6.4.2 Offline/Resume

- Local storage for pending changes
- Sync on reconnection
- Conflict resolution on sync

## 7. Implementation Phases

### Phase 1: Database & Backend (Week 1)

1. Create database migrations
2. Implement RLS policies
3. Create database functions
4. Update TypeScript types
5. Implement API services

### Phase 2: Core Components (Week 2)

1. Create `AddFundingDialog` component
2. Create `FundingCard` component
3. Create `FundingSummaryPanel` component
4. Implement `useInstanceFundings` hook
5. Implement `useCashFunds` hook

### Phase 3: Integration (Week 3)

1. Integrate funding into `InstanceDetail.tsx`
2. Integrate funding into `AddInstance.tsx`
3. Update `Funds.tsx` with usage tracking
4. Implement real-time updates
5. Add optimistic UI updates

### Phase 4: Testing & Polish (Week 4)

1. Unit tests for all components
2. Integration tests for API
3. E2E tests for user flows
4. Performance optimization
5. Error handling improvements

## 8. File Structure Changes

### 8.1 New Files

```
src/
├── components/
│   ├── AddFundingDialog.tsx
│   ├── FundingCard.tsx
│   └── FundingSummaryPanel.tsx
├── hooks/
│   ├── useInstanceFundings.ts
│   └── useCashFunds.ts
├── contexts/
│   └── FundingContext.tsx
└── types/
    └── funding.ts
```

### 8.2 Modified Files

```
src/
├── pages/
│   ├── InstanceDetail.tsx
│   ├── AddInstance.tsx
│   └── Funds.tsx
├── hooks/
│   └── useLoanFunds.ts
├── contexts/
│   └── InstancesContext.tsx
└── integrations/supabase/
    └── types.ts
```

### 8.3 Database Migrations

```
supabase/migrations/
├── 20250101000001_create_instance_fundings_table.sql
├── 20250101000002_create_cash_funds_table.sql
├── 20250101000003_add_funding_functions.sql
└── 20250101000004_add_funding_indexes.sql
```

## 9. Success Metrics

### 9.1 Functional Requirements

- ✅ Multiple fundings per instance
- ✅ Real-time balance updates
- ✅ Fund availability tracking
- ✅ Constraint enforcement
- ✅ Optimistic UI updates

### 9.2 Performance Requirements

- < 200ms for fund availability checks
- < 500ms for funding allocation
- Real-time updates within 1 second
- Offline functionality with sync

### 9.3 User Experience

- Intuitive fund selection interface
- Clear availability indicators
- Smooth real-time updates
- Helpful error messages
- Mobile-responsive design

## 10. Risk Mitigation

### 10.1 Technical Risks

- **Concurrency conflicts**: Atomic database operations + optimistic UI
- **Real-time sync issues**: Robust error handling + retry logic
- **Performance degradation**: Proper indexing + query optimization

### 10.2 User Experience Risks

- **Complex UI**: Progressive disclosure + clear information hierarchy
- **Data loss**: Optimistic updates + rollback mechanisms
- **Confusion**: Clear validation messages + help text

### 10.3 Business Risks

- **Data integrity**: Database constraints + server-side validation
- **Scalability**: Efficient queries + caching strategies
- **Maintenance**: Well-structured code + comprehensive tests

---

This implementation plan provides a comprehensive roadmap for adding the Funding Details feature while maintaining system integrity, performance, and user experience. The phased approach ensures manageable development cycles with clear deliverables and success criteria.
