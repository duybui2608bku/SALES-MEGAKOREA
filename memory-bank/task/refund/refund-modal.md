# Refund Modal Implementation

## Overview

The refund modal is a critical component in the service management system that allows processing refunds for sold services. It provides three refund types with specific business rules and UI/UX considerations.

## Features

### Refund Types

1. **Full Refund (100%)**

   - Refunds the entire service amount
   - Primary refund option
   - No additional calculations needed

2. **Refund by Sessions** (Currently Disabled)

   - Feature is disabled as per requirements
   - Placeholder for future implementation
   - Will allow partial refunds based on unused sessions

3. **Refund by Amount**
   - Custom refund amount
   - Amount validation against total service cost
   - Flexible option for partial refunds

## Technical Implementation

### Component Structure

- Location: `CLIENT/src/Modal/services/ModalRefund.tsx`
- Uses Ant Design components
- Implements TypeScript interfaces for type safety

### Styling

- Custom SCSS file: `_modal-refund.scss`
- Color scheme: Ant Design primary blue (#1677ff)
- Responsive design with proper spacing
- Animations and hover effects

### State Management

- Uses React Query for data operations
- Modal state handled through props
- Refund status tracking in service records

### UI Elements

- Refund type selection
- Amount input for custom refunds
- Validation messages
- History view button with popover
- Disabled states for processed refunds

## Business Rules

1. Refund button disabled after processing
2. Custom amount cannot exceed service cost
3. Refund history accessible through popover
4. Visual indicators for refunded services

## Integration Points

- Connects with service management system
- Updates service status after refund
- Records refund history
- Integrates with payment processing system

## Future Considerations

1. Session-based refund implementation
2. Enhanced refund history display
3. Additional validation rules
4. Automated refund processing

## Related Components

- SoldServices.card.service.tsx
  - Displays refund status
  - Handles refund button state
  - Shows TbCreditCardRefund icon for refunded items
  - Controls modal visibility
