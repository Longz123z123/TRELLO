export const chatbotRules = [
  /* ========================== */
  /* 1. TẠO BOARD               */
  /* ========================== */
  {
    keywords: ['tạo bảng', 'tạo board', 'tạo 1 bảng', 'tạo 1 board', 'tạo mới bảng', 'tạo mới board', 'cách tạo bảng', 'cách tạo board', 'hướng dẫn tạo bảng', 'hướng dẫn tạo board', 'create board', 'new board'],
    regex: [/tạo.*bảng/, /tạo.*board/], // ăn mọi câu dạng “tạo … bảng”
    answer: `
Để tạo bảng (Board) trên hệ thống của bạn, hãy làm theo các bước sau:

1. Nhấn về trang chủ (Boards page).
2. Nhấn nút **Create a new board** ở góc bên trái màn hình.
3. Điền các thông tin cần thiết:
   - Tên bảng (Board title)
   - Mô tả (Description) — nếu cần
   - Loại bảng (Public / Private)
4. Nhấn **Create** để hoàn tất.

Sau khi tạo xong, bảng mới sẽ xuất hiện trong danh sách Boards của bạn!
`
  },

  /* ========================== */
  /* 2. TẠO COLUMN              */
  /* ========================== */
  {
    keywords: ['thêm cột', 'tạo cột', 'tạo column', 'add column'],
    regex: [/tạo.*cột/, /thêm.*cột/],
    answer: `
Để thêm cột (Column), bạn thực hiện:

1. Mở Board bạn muốn thao tác.
2. Nhấn nút **Add new column**.
3. Nhập tên cột → nhấn **Add column**.

Cột mới sẽ xuất hiện ở cuối Board ngay lập tức.
`
  },

  /* ========================== */
  /* 3. THÊM CARD               */
  /* ========================== */
  {
    keywords: ['thêm thẻ', 'tạo thẻ', 'add card', 'create card', 'tạo card'],
    regex: [/tạo.*card/, /thêm.*card/, /tạo.*thẻ/],
    answer: `
Để thêm thẻ (Card) vào một cột, bạn làm như sau:

1. Mở Board bạn muốn thao tác.
2. Trong mỗi cột, ở cuối danh sách thẻ có nút **Add new card**.
3. Nhấn vào nút đó → nhập tiêu đề card.
4. Nhấn **Add** để tạo thẻ.

Thẻ mới sẽ xuất hiện ngay trong cột bạn đã chọn.
`
  },

  /* ========================== */
  /* 4. XÓA COLUMN              */
  /* ========================== */
  {
    keywords: ['xóa cột', 'delete column', 'remove column'],
    regex: [/x(ó|o)a.*cột/],
    answer: `
Để xóa một cột (Column), bạn thực hiện:

1. Di chuột lên tên cột cần xóa.
2. Nhấn biểu tượng **v** cột bạn cần xóa.
3. Chọn **Delete this column**.
4. Xác nhận thao tác nếu hệ thống yêu cầu.

Lưu ý: Khi xóa cột, toàn bộ thẻ (Card) trong cột đó cũng sẽ bị xóa theo.
`
  },

  /* ========================== */
  /* 5. MỜI THÀNH VIÊN          */
  /* ========================== */
  {
    keywords: ['mời thành viên', 'invite', 'mời người dùng', 'invite user'],
    regex: [/mời.*thành viên/, /invite/],
    answer: `
Để mời thành viên vào Board, bạn thực hiện:

1. Mở Board bạn muốn chia sẻ.
2. Ở góc phải giao diện Board, nhấn nút **Invite**.
3. Nhập email của người bạn muốn mời.
4. Nhấn **Send invitation**.

Người được mời sẽ nhận được thông báo và có thể **Accept** để tham gia Board.
`
  },

  /* ========================== */
  /* 6. CẬP NHẬT PROFILE        */
  /* ========================== */
  {
    keywords: ['cập nhật profile', 'cập nhật thông tin', 'update profile', 'đổi thông tin cá nhân', 'đổi mật khẩu', 'đổi ảnh đại diện', 'đổi avatar'],
    regex: [/cập.*nhật.*profile/, /đổi.*thông tin/],
    answer: `
Để cập nhật thông tin cá nhân (Profile), bạn thực hiện:

1. Nhấn vào avatar góc trên bên phải.
2. Chọn mục **Profile**.
3. Tại tab **Account**, bạn có thể chỉnh sửa:
   - Tên hiển thị
   - Ảnh đại diện
   Tại tab **Security**, bạn có thể chỉnh sửa:
   - Đổi mật khẩu
4. Nhấn **Save changes** để lưu lại.

Thông tin của bạn sẽ được cập nhật ngay lập tức.
`
  }
]
