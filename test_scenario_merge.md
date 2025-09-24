# Scenario Merge Functionality Test

## Test Plan

### Setup

1. Create an instance with:

   - Purchase price: $500,000
   - Weekly rent: $600
   - 2 funding allocations: $400k loan, $50k cash

2. Create a scenario and add the instance to it

3. In the scenario, modify:
   - Weekly rent: $650 (increase)
   - Add new funding: $30k loan
   - Update existing loan funding: $450k (increase from $400k)

### Expected Results After Apply (Merge Strategy)

#### Property Details

- Purchase price: $500,000 (unchanged - not modified in scenario)
- Weekly rent: $650 (updated from scenario)

#### Funding Allocations

- $450k loan (updated from scenario)
- $50k cash (preserved from original)
- $30k loan (added from scenario)
- **Total**: 3 funding allocations

#### Instance Status

- Status: "synced"
- Last synced: Current timestamp

## Test Steps

1. **Create Test Instance**

   ```sql
   -- This would be done through the UI
   -- Instance with basic property details and funding
   ```

2. **Create Scenario**

   ```sql
   -- This would be done through the UI
   -- Add instance to scenario
   ```

3. **Modify Scenario Instance**

   ```sql
   -- This would be done through the UI
   -- Update weekly rent, add funding, modify existing funding
   ```

4. **Apply Changes**

   ```sql
   -- Call the new merge function
   SELECT * FROM apply_scenario_instance_merge(
     'scenario-instance-id'::UUID,
     'merge'::TEXT
   );
   ```

5. **Verify Results**

   ```sql
   -- Check instance data
   SELECT
     purchase_price,
     weekly_rent,
     (SELECT COUNT(*) FROM instance_fundings WHERE instance_id = 'instance-id') as funding_count
   FROM instances
   WHERE id = 'instance-id';

   -- Check funding details
   SELECT
     fund_type,
     amount_allocated,
     notes
   FROM instance_fundings
   WHERE instance_id = 'instance-id'
   ORDER BY fund_type, amount_allocated;
   ```

## Expected Database Function Behavior

The `apply_scenario_instance_merge` function should:

1. **Return success**: `success = true`
2. **Return message**: "Instance updated successfully with merged scenario changes"
3. **Return counts**:
   - `merged_funding_count = 3` (2 existing + 1 new)
   - `merged_investors_count = 0` (if no investor changes)

## Verification Checklist

- [ ] Original funding preserved
- [ ] New funding added
- [ ] Modified funding updated
- [ ] Unchanged property details preserved
- [ ] Modified property details updated
- [ ] No data loss
- [ ] Scenario instance marked as synced
- [ ] Application record created

## Rollback Test

If merge doesn't work as expected, test the overwrite strategy:

```sql
SELECT * FROM apply_scenario_instance_merge(
  'scenario-instance-id'::UUID,
  'overwrite'::TEXT
);
```

This should replace all data with scenario data (original behavior).
