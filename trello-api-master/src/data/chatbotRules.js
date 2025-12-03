export const chatbotRules = [
  /* ======================================= */
  /* 1 — LỖI (ƯU TIÊN CAO NHẤT)              */
  /* ======================================= */

  /* Lỗi: Không kéo card */
  {
    keywords: ['không kéo card', 'không drag card', 'lỗi drag card'],
    regex: [/không.*kéo.*card/, /drag.*không/],
    answer: `
Bạn không kéo thả được Card có thể do:

1. Phiên đăng nhập đã hết hạn → hãy đăng nhập lại.
2. Bạn không phải thành viên Board.
3. Dữ liệu Board chưa đồng bộ → thử F5.
4. Kéo sai vùng drop hợp lệ.
5. Socket realtime bị mất kết nối.

Hãy reload hoặc đăng nhập lại để khắc phục nhanh.
`
  },

  /* Lỗi: Không kéo column */
  {
    keywords: ['không kéo cột', 'không kéo thả cột', 'không drag column', 'lỗi kéo cột'],
    regex: [/không.*kéo.*cột/, /drag.*column.*không/],
    answer: `
Bạn không kéo thả được Column có thể do:

1. Bạn không phải thành viên Board hoặc không có quyền chỉnh sửa.
2. Phiên đăng nhập hết hạn.
3. Board chưa đồng bộ → thử F5.
4. Bạn không kéo đúng vùng tiêu đề (header).
5. Socket realtime mất kết nối.

Hãy reload hoặc đăng nhập lại.
`
  },

  /* ======================================= */
  /* 2 — BOARD                               */
  /* ======================================= */

  /* Tạo Board */
  {
    keywords: ['tạo bảng', 'tạo board', 'tạo 1 bảng', 'tạo mới board', 'create board', 'new board'],
    regex: [/tạo.*bảng/, /tạo.*board/],
    answer: `
Để tạo bảng (Board):

1. Nhấn về trang chủ **Boards page**.
2. Bấm **Create a new board**.
3. Nhập thông tin: tên bảng, mô tả, chế độ Public/Private.
4. Nhấn **Create**.

Board mới sẽ xuất hiện ngay trong danh sách Boards.
`
  },

  /* ======================================= */
  /* 3 — COLUMN                              */
  /* ======================================= */

  /* Tạo Column */
  {
    keywords: ['thêm cột', 'tạo cột', 'tạo column', 'add column'],
    regex: [/tạo.*cột/, /thêm.*cột/],
    answer: `
Để thêm Column:

1. Mở Board bạn muốn thao tác.
2. Nhấn **Add new column**.
3. Nhập tên → nhấn **Add column**.

Cột mới sẽ xuất hiện ngay lập tức.
`
  },

  /* Đổi tên Column */
  {
    keywords: ['đổi tên cột', 'đổi tên column', 'rename column', 'sửa tên cột'],
    regex: [/đổi.*tên.*cột/, /rename.*column/],
    answer: `
Để đổi tên Column:

1. Truy cập Board chứa Column đó.
2. Nhấp đúp vào tên Column.
3. Nhập tên mới → nhấn Enter để lưu.

Tên được cập nhật realtime cho mọi thành viên.
`
  },

  /* Xóa Column */
  {
    keywords: ['xóa cột', 'delete column', 'remove column'],
    regex: [/x(ó|o)a.*cột/],
    answer: `
Để xóa Column:

1. Di chuột lên tiêu đề cột.
2. Nhấn biểu tượng **v**.
3. Chọn **Delete this column**.
4. Xác nhận để xóa.

Lưu ý: Tất cả Card trong cột cũng sẽ bị xóa.
`
  },

  /* ======================================= */
  /* 4 — CARD                                */
  /* ======================================= */

  /* Thêm Card */
  {
    keywords: ['thêm thẻ', 'tạo card', 'add card', 'create card'],
    regex: [/tạo.*card/, /thêm.*card/],
    answer: `
Để thêm Card:

1. Mở Column muốn thêm card.
2. Nhấn **Add new card**.
3. Nhập tiêu đề → nhấn **Add**.

Card mới sẽ xuất hiện ngay lập tức.
`
  },

  /* Xóa Card */
  {
    keywords: ['xóa card', 'delete card', 'remove card'],
    regex: [/x(ó|o)a.*card/],
    answer: `
Để xóa Card:

1. Mở **Card Detail**.
2. Nhấn **Delete card**.
3. Xác nhận **Confirm**.

Card sẽ bị xóa vĩnh viễn.
`
  },

  /* Sửa mô tả Card */
  {
    keywords: ['sửa mô tả', 'edit description'],
    regex: [/sửa.*mô.*tả/, /edit.*description/],
    answer: `
Để sửa mô tả Card:

1. Mở Card Detail.
2. Nhấn vào **Description** → Edit.
3. Nhập nội dung mới → **Save**.

Mô tả được cập nhật realtime.
`
  },

  /* ======================================= */
  /* 5 — DRAG & DROP                         */
  /* ======================================= */

  {
    keywords: ['kéo thả', 'kéo card', 'drag drop', 'move card'],
    regex: [/^(?!.*không).*kéo.*thả/, /^(?!.*không).*kéo.*card/, /^(?!.*không).*drag.*drop/],
    answer: `
Hệ thống hỗ trợ kéo – thả:

⭐ Kéo Card
1. Giữ card.
2. Kéo đến vị trí mới.
3. Thả chuột để hoàn tất.

⭐ Kéo Column
1. Giữ phần các góc của cột
2. Kéo sang vị trí mới.
3. Thả chuột để sắp xếp lại.

Mọi thao tác được cập nhật realtime cho thành viên Board.
`
  },

  /* ======================================= */
  /* 6 — ATTACHMENT                          */
  /* ======================================= */

  {
    keywords: ['thêm file', 'upload file', 'đính kèm file', 'attachment'],
    regex: [/đính.*kèm/, /upload.*file/],
    answer: `
Để thêm file vào Card:

1. Mở Card Detail.
2. Nhấn **Attachment**.
3. Chọn file → xác nhận.

File sẽ hiển thị ngay trong Card.
`
  },

  /* ======================================= */
  /* 7 — MEMBERS                             */
  /* ======================================= */

  {
    keywords: ['xem thành viên', 'danh sách thành viên'],
    regex: [/thành.*viên.*board/],
    answer: `
Để xem thành viên Board:

1. Mở Board.
2. Xem danh sách avatar ở góc phải.
3. Nhấn để xem thông tin thành viên.

Bạn có thể mời hoặc xóa thành viên tùy quyền.
`
  },

  /* ======================================= */
  /* 8 — PROFILE                             */
  /* ======================================= */

  {
    keywords: ['cập nhật profile', 'đổi mật khẩu', 'đổi avatar'],
    regex: [/cập.*nhật.*profile/, /đổi.*avatar/],
    answer: `
Để cập nhật Profile:

1. Nhấn vào avatar góc phải.
2. Chọn **Profile**.
3. Chỉnh sửa thông tin / avatar / mật khẩu.
4. Nhấn **Save changes**.

Thông tin sẽ cập nhật ngay lập tức.
`
  }
]
