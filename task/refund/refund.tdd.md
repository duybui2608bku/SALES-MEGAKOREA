# Technical Design Document

## New Flow: Hoàn Tiền Cho Khách Hàng (Refund Processing)

### Overview

Thêm luồng cho phép hoàn tiền cho khách hàng từ các `services_card_sold_of_customer` theo ba phương thức: hoàn tiền theo số buổi, hoàn tiền theo phần trăm, hoàn tiền theo số tiền cụ thể. Các thông tin hoàn tiền sẽ được lưu trong trường `refund` thông qua API `services-card/sold-of-customer/update`.

### Purpose

Hệ thống cần cho phép quản lý hoàn tiền cho khách hàng một cách linh hoạt, hỗ trợ nhiều phương thức hoàn tiền khác nhau dựa trên nhu cầu cụ thể, đồng thời đảm bảo tính toàn vẹn dữ liệu và quy trình nghiệp vụ.

### Design

#### Data Models

1. **RefundEnum:** Đã được định nghĩa trong `src/constants/enum.ts`

   ```typescript
   export enum RefundEnum {
     NONE = 0,
     PARTIAL_FULL_TREATMENT = 1, // Hoàn tiền theo số buổi
     PARTIAL_HALF_TREATMENT = 2, // Hoàn tiền theo %
     FULL = 3, // Hoàn tiền toàn bộ
   }
   ```

2. **RefundType:** Interface cho trường `refund`
   ```typescript
   export interface RefundType {
     type: RefundEnum;
     price: number;
   }
   ```

#### API/Backend Flow

1. **Cập nhật trạng thái hoàn tiền:**

   - API: `PATCH /services-card/sold-of-customer/update`
   - Payload:

   ```json
   {
     "id": "services_card_sold_of_customer_id",
     "refund": {
       "type": 3, // RefundEnum value
       "price": 32000000 // Số tiền hoàn lại
     }
   }
   ```

2. **Middleware kiểm tra điều kiện hoàn tiền:**

   - Với `RefundEnum.FULL`: Phải đảm bảo `used === 0` (chưa sử dụng dịch vụ).
   - Với `RefundEnum.PARTIAL_FULL_TREATMENT`: Tính toán số tiền hoàn dựa trên số buổi chưa sử dụng.
   - Với `RefundEnum.PARTIAL_HALF_TREATMENT`: Áp dụng phần trăm hoàn tiền trên giá trị còn lại.
   - Luôn đảm bảo: số tiền hoàn + số tiền đã hoàn trước đó <= price (giá gốc).

3. **Service layer:**
   - Xử lý logic hoàn tiền cho từng loại.
   - Với hoàn tiền theo số buổi: `refundPrice = (quantity - used) * (price / quantity)`.
   - Với hoàn tiền theo %: Áp dụng phần trăm được chỉ định trên giá trị còn lại.
   - Với hoàn tiền 100%: `refundPrice = price_paid`.

#### Frontend Flow

1. Tại bảng danh sách dịch vụ đã bán, nhấn nút "Hoàn tiền" (ở cột hành động).
2. Hiển thị modal chọn phương thức hoàn tiền:
   - Nếu `used === 0`: Hiển thị tùy chọn "Hoàn tiền 100%".
   - Luôn hiển thị các tùy chọn "Hoàn tiền theo số buổi" và "Hoàn tiền theo số tiền".
3. Tùy theo phương thức hoàn tiền:
   - **Hoàn tiền 100%**: Hiển thị xác nhận hoàn toàn bộ số tiền `price_paid`.
   - **Hoàn tiền theo số buổi**: Hiển thị số buổi còn lại và số tiền tương ứng sẽ hoàn.
   - **Hoàn tiền theo số tiền**: Hiển thị input để nhập số tiền hoàn với validation.
4. Khi xác nhận, gọi API `services-card/sold-of-customer/update` với thông tin hoàn tiền tương ứng.

### Validation and Rules

- **Hoàn tiền 100%**: `used === 0`.
- **Hoàn tiền theo số buổi**:
  - Công thức: `refundPrice = (quantity - used) * (price / quantity)`.
  - Điều kiện: `used < quantity`.
- **Hoàn tiền theo số tiền**:
  - Điều kiện: Số tiền hoàn <= `price - price_paid`.
  - Frontend và backend đều cần validate.
- Tổng số tiền hoàn (bao gồm các lần hoàn trước) không vượt quá giá gốc `price`.

### Dependencies

- MongoDB: `services_card_sold_of_customer` collection

### Open Questions

- Cần xử lý logic gì nếu dịch vụ đã được chia hoa hồng?
- Có nên lưu lịch sử hoàn tiền để theo dõi?
- Cần có quyền phê duyệt đặc biệt cho hoàn tiền hay không?
