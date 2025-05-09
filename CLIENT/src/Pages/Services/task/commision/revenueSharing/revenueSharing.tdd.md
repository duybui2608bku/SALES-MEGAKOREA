# Technical Design Document

## New Flow: Chia Doanh Số Cho Nhân Viên (Commission Distribution)

### Overview

Thêm luồng cho phép chia doanh số từ một `services_card_sold_of_customer` cho các nhân viên kỹ thuật bằng cách tạo các bản ghi `commision_seller` rồi gán vào trường `employee_commision` thông qua API `services-card/sold-of-customer/update`.

### Purpose

Hệ thống cần cho phép quản lý chia doanh số thủ công cho nhiều nhân viên trên từng dịch vụ đã bán, đảm bảo tổng doanh số chia không vượt quá giá trị đã thanh toán (`price_paid`).

### Design

#### API/Backend Flow

1. **Tạo commission cho từng nhân viên:**

   - API đã tồn tại: `POST /commision/seller/create`
   - Payload gồm thông tin: nhân viên (`user_id`), số tiền được chia (`value`), tham chiếu `service_card_sold_id`
   - Kết quả trả về `insertedId` của bản ghi commission mới.

2. **Cập nhật lại `employee_commision`:**
   - API: `PATCH /services-card/sold-of-customer/update`
   - Payload:
   ```json
   {
     "id": "services_card_sold_of_customer_id",
     "employee_commision": ["681d61d41e9ce65e51970fea", ...]
   }
   ```

#### Frontend Flow

1. Tại bảng danh sách, nhấn nút "Chia doanh số" (ở cột hành động).
2. Component `OptionsGetUsersWithRole` được gọi để lấy danh sách nhân viên, mặc định không truyền role để lấy tất cả nhân viên.
3. Hiển thị modal chia doanh số, cho phép:
   - Nhập số tiền chia cho từng nhân viên.
   - Tổng số tiền chia không vượt quá `price_paid`.
4. Khi xác nhận:
   - Gọi API tạo `commission` cho từng nhân viên.
   - Tổng hợp các `insertedId` trả về.
   - Gửi các ID này vào trường `employee_commision` thông qua API update.

### Validation and Rules

- Tổng doanh số chia ≤ `price_paid` (frontend validate).
- Mỗi lần nhấn xác nhận sẽ:
  - Gửi nhiều request song song tới `commision/seller/create`
  - Sau đó gọi 1 lần duy nhất `services-card/sold-of-customer/update`

### Dependencies

- MongoDB: `commission` collection
- MongoDB: `services_card_sold_of_customer` collection

### Open Questions

- Có cần rollback nếu 1 commission tạo thất bại?
- Có cần phân biệt nhân viên chính/phụ khi chia?
- Có yêu cầu ghi lại lịch sử chia để hiển thị?
