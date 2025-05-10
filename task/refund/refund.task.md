# Task Document

## Refund Feature Implementation

### Checklist of Backend Tasks

- Task 1: Đảm bảo API `services-card/sold-of-customer/update` hỗ trợ cập nhật trường `refund`
- Task 2: Phát triển middleware để kiểm tra điều kiện hoàn tiền:

  - Kiểm tra điều kiện hoàn tiền 100% (type = FULL): chỉ cho phép khi service.used === 0
  - Kiểm tra điều kiện hoàn tiền theo số buổi (type = PARTIAL_FULL_TREATMENT): chỉ cho phép khi service.used < service.quantity
  - Kiểm tra số tiền hoàn theo buổi không vượt quá số tiền cho phép
  - Kiểm tra số tiền hoàn không vượt quá tổng số tiền còn lại (price - price_paid)
  - Đảm bảo tổng số tiền hoàn trả (bao gồm các lần trước) không vượt quá giá gốc

- Task 3: Phát triển service layer cho xử lý logic hoàn tiền:

  - Tính toán số tiền hoàn cho từng loại hoàn tiền
  - Với hoàn tiền 100%: refundPrice = price_paid
  - Với hoàn tiền theo số buổi: refundPrice = (quantity - used) \* (price / quantity)
  - Với hoàn tiền theo %: áp dụng % được chỉ định trên giá trị còn lại

- Task 4: Cập nhật controller để xử lý hoàn tiền:

  - Cập nhật trường refund trong document services_card_sold_of_customer
  - Xử lý các trường hợp lỗi và phản hồi phù hợp

- Task 5: Viết unit test cho middleware và service:
  - Test hoàn tiền 100% khi dịch vụ chưa sử dụng
  - Test từ chối hoàn tiền 100% khi dịch vụ đã sử dụng
  - Test tính toán chính xác số tiền hoàn theo số buổi
  - Test từ chối số tiền hoàn vượt quá giá dịch vụ

### Checklist of Frontend Tasks

- Task 1: Thêm nút "Hoàn tiền" trong bảng danh sách dịch vụ đã bán

  - Chỉ hiện nút khi dịch vụ chưa hoàn tiền hoặc chưa hoàn tiền toàn bộ

- Task 2: Phát triển Modal hoàn tiền với các tùy chọn:

  - Hiển thị tùy chọn "Hoàn tiền 100%" chỉ khi dịch vụ chưa sử dụng (used === 0)
  - Hiển thị tùy chọn "Hoàn tiền theo số buổi" với số buổi còn lại và số tiền tương ứng
  - Hiển thị tùy chọn "Hoàn tiền theo số tiền" với ô nhập số tiền và validation
  - Hiển thị số tiền hoàn tự động tính toán cho từng phương thức

- Task 3: Xử lý logic gọi API trong component chính:

  - Gọi API `services-card/sold-of-customer/update` với thông tin refund
  - Xử lý kết quả thành công và thất bại
  - Làm mới danh sách dịch vụ sau khi hoàn tiền thành công

- Task 4: Thêm hiển thị trạng thái hoàn tiền trong bảng:

  - Hiển thị tag "Đang hoạt động" khi chưa hoàn tiền
  - Hiển thị tag "Đã hoàn tiền toàn bộ" khi đã hoàn 100%
  - Hiển thị tag "Đã hoàn tiền theo buổi" hoặc "Đã hoàn tiền một phần" tương ứng
  - Thể hiện số tiền đã hoàn và loại hoàn tiền

- Task 5: Viết unit test cho component:
  - Test hiển thị các tùy chọn hoàn tiền dựa trên trạng thái dịch vụ
  - Test tính toán chính xác số tiền hoàn theo từng phương thức
  - Test validation cho số tiền hoàn tự nhập

### Testing

- Test hoàn tiền 100% khi `used === 0`
- Test hoàn tiền theo số buổi khi `used < quantity`
- Test hoàn tiền theo số tiền với số tiền hợp lệ/không hợp lệ
- Test xử lý lỗi từ API
- Test hiển thị trạng thái hoàn tiền sau khi hoàn tiền thành công
- Test case đặc biệt: dịch vụ đã hoàn tiền một phần trước đó
