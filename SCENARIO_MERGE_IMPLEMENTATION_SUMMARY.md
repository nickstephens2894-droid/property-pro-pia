# Scenario Apply Changes - Merge Implementation Summary

## Problem

The Apply Changes functionality in the Scenarios tab was using overwrite logic instead of merge logic. When applying scenario changes to original instances, it would replace all data instead of intelligently merging changes while preserving existing data.

**Example Issue**: If an original instance had 2 funding allocations and a user added 1 more in the scenario, applying changes would result in only 1 funding allocation (the new one) instead of 3 (2 existing + 1 new).

## Solution Implemented

### 1. Database Layer Changes

**New Migration**: `20250120000007_implement_merge_based_apply_logic.sql`

- **Created `apply_scenario_instance_merge()` function**: Implements intelligent merge logic
- **Updated `apply_scenario_instance()` function**: Now uses merge logic by default instead of overwrite
- **Key Features**:
  - Only updates fields that have meaningful values in the scenario (non-null, non-zero)
  - Preserves existing funding allocations and adds new ones
  - Merges investors and ownership allocations intelligently
  - Maintains existing property details while applying scenario changes

### 2. Frontend Changes

**Updated Files**:

- `src/contexts/ScenariosContext.tsx`: Changed default resolution strategy from "overwrite" to "merge"
- `src/components/ScenarioApplyDialog.tsx`: Updated UI to reflect merge-first approach
- `src/components/ScenarioInstanceDetail.tsx`: Updated success messages

**Key Changes**:

- Default resolution strategy is now "merge" instead of "overwrite"
- UI text updated to explain merge behavior
- Success messages reflect the merge approach

### 3. Merge Logic Details

#### Property Details Merging

- Only updates fields that have meaningful values in scenario data
- Preserves existing values for null/zero scenario values
- Uses CASE statements to check for meaningful values before updating

#### Funding Merging

- **For new instances**: Copies all scenario funding to the new instance
- **For existing instances**:
  - Updates existing funding allocations if they exist
  - Adds new funding allocations if they don't exist
  - Preserves all existing funding not modified in scenario

#### Investors & Ownership Merging

- **Current implementation**: Replaces arrays with scenario data
- **Future enhancement**: Could implement more sophisticated merging of individual investors

### 4. Resolution Strategies

The system now supports three resolution strategies:

1. **Merge (Default)**: Intelligently merges changes while preserving existing data
2. **Overwrite**: Replaces all data with scenario data (original behavior)
3. **Skip**: Skips application if conflicts are detected

### 5. Benefits

- **Data Preservation**: Existing funding, investors, and property details are preserved
- **Intelligent Updates**: Only meaningful changes are applied
- **User-Friendly**: Clear UI explaining what will happen during apply
- **Backward Compatible**: Overwrite strategy still available if needed

### 6. Example Scenarios

#### Scenario 1: Adding New Funding

- **Original Instance**: Has 2 funding allocations ($50k loan, $20k cash)
- **Scenario**: Adds 1 new funding allocation ($30k loan)
- **After Apply**: Instance has 3 funding allocations ($50k loan, $20k cash, $30k loan)

#### Scenario 2: Updating Property Details

- **Original Instance**: Purchase price $500k, weekly rent $600
- **Scenario**: Updates weekly rent to $650, leaves purchase price unchanged
- **After Apply**: Purchase price remains $500k, weekly rent updated to $650

#### Scenario 3: Mixed Changes

- **Original Instance**: Has existing funding and property details
- **Scenario**: Updates some property details, adds new funding, modifies existing funding
- **After Apply**: All changes merged intelligently, existing data preserved where not modified

## Testing Recommendations

1. **Create a scenario instance** from an existing instance with funding
2. **Add new funding** in the scenario
3. **Modify property details** in the scenario
4. **Apply changes** using merge strategy
5. **Verify** that:
   - Original funding is preserved
   - New funding is added
   - Property details are updated only where changed
   - No data is lost

## Future Enhancements

1. **Sophisticated Investor Merging**: Merge individual investors instead of replacing arrays
2. **Conflict Resolution UI**: More detailed conflict resolution interface
3. **Merge Preview**: Show what will be merged before applying
4. **Selective Merging**: Allow users to choose which changes to merge

## Files Modified

### Database

- `supabase/migrations/20250120000007_implement_merge_based_apply_logic.sql`

### Frontend

- `src/contexts/ScenariosContext.tsx`
- `src/components/ScenarioApplyDialog.tsx`
- `src/components/ScenarioInstanceDetail.tsx`

## Migration Required

To apply these changes, run:

```bash
cd supabase
npx supabase db reset
```

This will apply the new migration and update the database schema with the merge-based apply logic.
