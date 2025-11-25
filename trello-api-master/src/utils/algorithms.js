/**
 * Tính toán giá trị skip phục vụ các tác vụ phân trang

 */

export const pagingSkipValue = (page, itemsPerPage) => {
  // Nếu page hoặc itemsPerPage không hợp lệ → return 0
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0

  /**
   * Giải thích công thức đơn giản:
   * Mỗi page hiển thị itemsPerPage bản ghi (ví dụ: 12)
   *
   * Page 1 → skip = (1 - 1) * 12 = 0
   * Page 2 → skip = (2 - 1) * 12 = 12
   * Page 5 → skip = (5 - 1) * 12 = 48
   * ...
   * Công thức chung: (page - 1) * itemsPerPage
   */

  return (page - 1) * itemsPerPage
}
