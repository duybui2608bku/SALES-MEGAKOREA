# Task Document

## Commission Distribution Implementation

### Checklist of Backend Tasks

- Task 1: Confirm `commision/seller/create` API supports necessary fields: `user_id`, `service_card_sold_id`, `value`
- Task 2: Ensure API returns `insertedId` reliably for frontend to use
- Task 3: Confirm `services-card/sold-of-customer/update` supports updating `employee_commision` as array of IDs
- Task 4: Add optional logging of commission changes for audit if needed

### Checklist of Frontend Tasks

- Task 1: Add action button "Chia doanh số" in table row
- Task 2: Integrate `OptionsGetUsersWithRole` to fetch employee list
- Task 3: Build modal with dynamic input fields for each employee
- Task 4: Validate that total amount ≤ `price_paid`
- Task 5: On submit, for each employee:
  - Call `commision/seller/create`
  - Collect all `insertedId`
- Task 6: Call `services-card/sold-of-customer/update` with `employee_commision`

### Testing

- Test API integration end-to-end: create commission → update service
- Test edge case: chia vượt `price_paid` → show error
- Test network error handling: retry failed API calls
- Test UI modal với nhiều nhân viên được chia
