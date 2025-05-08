# Task Breakdown Rules

You are an expert project manager and software architect. Given a technical design document, your task is to break it down into a comprehensive, actionable checklist of smaller tasks. This checklist should be suitable for assigning to developers and tracking progress.

## Input

You will receive a Markdown document representing the technical design of a feature or component. This document will follow the structure outlined in the "Documentation Style" section above (Overview, Purpose, Design, Dependencies, Usage, Error Handling, Open Questions).

---

## Input (Technical Design Document - Excerpt)

### New API `sold/update-quantity`

**Overview:**  
Create a new API endpoint `sold/update-quantity` that supports increasing the **total quantity** of a service on a card (different from increasing the number of times used).

**Purpose:**  
Allow admins or automation flows to programmatically increase the total number of times a service can be used (i.e., total session count), without affecting how many times it has been used.

**Design:**

- Accept a request body with the following:
  - `id`: the services_card_sold_of_customer to be updated history quantity
  - `services_card_sold_id`:" the services_card_sold_id inclue servies id
  - `service_id`: the specific service whose quantity is being increased
  - `quantity`: auto increase 1
  - `meida`: the image url from client
- Backend logic will:
  - Middlerware entry body
  - Increase quantity
  - Save changes
  - Return updated object

**Dependencies:**

- MongoDB (`services_of_card` collection)
- MongoDB (`services_card_sold_of_customer` collection)

**Usage Example (POST Body):**

```json
{
  "id": "680c4a9839f6a2d4fb18ce24",
  "commision_of_technician_id": "680a02fa98d65e1193672ae2",
  "services_card_sold_id": "680c3e164186db79763b6e81",
  "services_id": "680b4b68b59ac78ae3e5cf72",
  "media": ["url"],
  "history_increase_quantity": {
    "name_service": "Dịch vụ môi",
    "user_name": "Duy",
    "count": 1,
    "date": "2025-03-29T08:18:22.003+00:00",
    "descriptions": "thêm"
  }
}
```

**API Creation Tasks:**

- [ ] Task 1: Create new endpoint `sold/update-quantity`.
- [ ] Task 2: Define accepted fields: `card_id`, `service_id`, `add_quantity`.
- [ ] Task 3: Implement backend logic to:
  - [ ] Locate `services_of_card` record using `card_id` and `service_id`.
  - [ ] Validate that `add_quantity` is a positive integer.
  - [ ] Increment `quantity` by `add_quantity`.
  - [ ] Save changes and return updated object.

**Validation and Error Handling:**

- [ ] Task 4: Return 400 error if `add_quantity` is missing or not a positive number.
- [ ] Task 5: Return 404 if no matching service is found.

**Testing:**

- [ ] Task 6: Write unit tests for `sold/update-quantity` logic:
  - [ ] Test valid quantity increase.
  - [ ] Test error for missing or invalid `add_quantity`.
  - [ ] Test service not found condition.

**Documentation:**

- [ ] Task 7: Add new endpoint to API documentation (OpenAPI/Swagger/Postman).
- [ ] Task 8: Document update behavior in developer documentation.
