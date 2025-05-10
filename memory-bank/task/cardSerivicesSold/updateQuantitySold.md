# Phát triển tính năng phê duyệt tăng số lần sử dụng dịch vụ

## Tính năng đã hoàn thành

### Hệ thống phê duyệt tăng số lần dịch vụ

1. Chức năng yêu cầu tăng số lần

   - ✅ Modal yêu cầu tăng số lần dịch vụ
   - ✅ Xác nhận thông tin dịch vụ hiện tại
   - ✅ Tích hợp giao diện Ant Design
   - ✅ Hiển thị trạng thái phê duyệt
   - ✅ Thông báo khi yêu cầu được tạo
   - ✅ Xem lịch sử yêu cầu tăng số lần
   - ✅ Gửi thông báo đến admin khi có yêu cầu mới

2. Quản lý yêu cầu (dành cho Admin)
   - ✅ Bảng điều khiển quản lý yêu cầu tăng số lần
   - ✅ Bộ lọc theo trạng thái (Đang chờ, Đã phê duyệt, Từ chối)
   - ✅ Chức năng phê duyệt/từ chối với lý do
   - ✅ Thông báo cho người dùng khi yêu cầu được xử lý
   - ✅ Lịch sử hành động của admin

## Đang tiến hành

1. Quản lý dịch vụ

   - 🔄 Báo cáo tổng hợp các yêu cầu tăng số lần
   - 🔄 Cải thiện giao diện hiển thị lịch sử phê duyệt
   - 🔄 Thêm quy tắc kiểm tra hợp lệ cho yêu cầu

2. Thông báo
   - 🔄 Thông báo email khi yêu cầu thay đổi trạng thái
   - 🔄 Thông báo trong ứng dụng (real-time)

## Vấn đề đã biết

- Thời gian phản hồi chậm khi có nhiều yêu cầu cùng một lúc
- Hiệu suất trang quản lý yêu cầu giảm khi có quá nhiều bản ghi

## Thay đổi gần đây

1. Cải tiến UI/UX

   - Thêm biểu tượng trạng thái rõ ràng (màu và icon)
   - Tối ưu hóa hiển thị trên thiết bị di động
   - Thêm hiệu ứng chuyển đổi khi trạng thái thay đổi

2. Cập nhật tính năng
   - Thêm tùy chọn lý do từ chối dạng mẫu
   - Cải thiện hệ thống lọc và sắp xếp yêu cầu
   - Hỗ trợ tải lên tài liệu đính kèm cho yêu cầu

## Sự phát triển của các quyết định

1. Luồng phê duyệt

   - Ban đầu: Chỉ admin có thể phê duyệt
   - Hiện tại: Quản lý cấp trung có thể phê duyệt với hạn mức
   - Lý do: Tăng tốc độ xử lý yêu cầu

2. Thông báo

   - Ban đầu: Chỉ thông báo trong ứng dụng
   - Hiện tại: Thông báo qua email và trong ứng dụng
   - Lý do: Cải thiện trải nghiệm người dùng và tỷ lệ phản hồi

3. Giới hạn yêu cầu
   - Ban đầu: Không giới hạn số lượng yêu cầu
   - Hiện tại: Giới hạn 3 yêu cầu đang chờ/người dùng
   - Lý do: Ngăn chặn lạm dụng hệ thống

## Cấu trúc cơ sở dữ liệu

### Bảng mới

Tự phát triển

## API Endpoints

Tự phát triển

## Thay đổi Frontend

### Người dùng thông thường

1. Thêm nút "Yêu cầu tăng số lần" trong trang chi tiết dịch vụ
2. Tạo modal form yêu cầu tăng số lần với các trường:
   - Số lượng hiện tại (readonly)
   - Số lượng yêu cầu
   - Lý do
3. Thêm tab "Yêu cầu của tôi" trong trang quản lý dịch vụ
4. Hiển thị trạng thái yêu cầu với màu sắc và biểu tượng:
   - Đang chờ: Màu vàng, icon đồng hồ
   - Đã phê duyệt: Màu xanh lá, icon check
   - Từ chối: Màu đỏ, icon X

### Admin

1. Thêm menu "Quản lý yêu cầu tăng số lần" trong dashboard admin
2. Tạo trang quản lý với bảng hiển thị:
   - ID yêu cầu
   - Người dùng
   - Dịch vụ
   - Số lượng hiện tại
   - Số lượng yêu cầu
   - Ngày tạo
   - Trạng thái
   - Hành động (Phê duyệt/Từ chối)
3. Tạo modal xác nhận phê duyệt/từ chối với trường ghi chú
4. Thêm biểu đồ thống kê yêu cầu theo trạng thái và thời gian

## Thay đổi Backend

### Controllers

## Logic xử lý

1. Khi người dùng yêu cầu tăng số lần dịch vụ:

   - Kiểm tra xem dịch vụ có tồn tại và người dùng có quyền sử dụng
   - Tạo bản ghi mới trong bảng `service_quantity_requests` với trạng thái "pending"
   - Tạo bản ghi trong `service_request_history` với action "created"
   - Gửi thông báo cho admin về yêu cầu mới

2. Khi admin phê duyệt yêu cầu:

   - Cập nhật trạng thái yêu cầu thành "approved"
   - Cập nhật số lượng dịch vụ của người dùng
   - Tạo bản ghi trong `service_request_history` với action "approved"
   - Gửi thông báo cho người dùng về việc yêu cầu được phê duyệt

3. Khi admin từ chối yêu cầu:
   - Cập nhật trạng thái yêu cầu thành "rejected"
   - Tạo bản ghi trong `service_request_history` với action "rejected"
   - Gửi thông báo cho người dùng về việc yêu cầu bị từ chối

## Chiến lược triển khai

1. Phát triển cơ sở dữ liệu:

   - Tạo các bảng mới và các mối quan hệ
   - Thêm các chỉ mục để tối ưu hiệu suất truy vấn

2. Phát triển backend:

   - Tạo các API endpoint cho người dùng và admin
   - Viết các controller, service và middleware cần thiết
   - Triển khai logic xử lý

3. Phát triển frontend:

   - Tạo các component UI cần thiết
   - Tích hợp với API backend
   - Triển khai chức năng thông báo

4. Kiểm thử:

   - Kiểm thử các API
   - Kiểm thử giao diện người dùng
   - Kiểm thử quy trình phê duyệt end-to-end

5. Đưa vào sản xuất:
   - Triển khai cập nhật cơ sở dữ liệu
   - Triển khai API backend
   - Triển khai UI frontend

## Kế hoạch tương lai

1. Mở rộng hệ thống phê duyệt cho các tính năng khác
2. Tự động hóa một số quy trình phê duyệt dựa trên quy tắc
3. Cung cấp API cho ứng dụng di động
4. Tích hợp với các hệ thống thông báo khác (SMS, Slack, etc.)
