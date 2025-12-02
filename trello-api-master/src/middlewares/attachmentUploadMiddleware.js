import multer from 'multer'
import fs from 'fs'

/** ---------------------------------------
 * 1. TỰ ĐỘNG TẠO FOLDER NẾU CHƯA TỒN TẠI
 * -------------------------------------- */
const ATTACHMENT_DIR = 'uploads/attachments'

if (!fs.existsSync(ATTACHMENT_DIR)) {
  fs.mkdirSync(ATTACHMENT_DIR, { recursive: true })
}

/** ---------------------------------------
 * 2. SETUP STORAGE
 * -------------------------------------- */
const attachmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ATTACHMENT_DIR)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

/** ---------------------------------------
 * 3. FILE FILTER (CÓ THỂ GIỚI HẠN)
 * --------------------------------------
 * Nếu bạn muốn giới hạn loại file được phép upload
 * thì bật logic bên dưới.
 * Mặc định: cho phép mọi loại file (Trello cũng vậy)
 */
const attachmentFileFilter = (req, file, cb) => {
  // Ví dụ giới hạn file pdf / doc / zip:
  // const allowed = [
  //   'application/pdf',
  //   'application/zip',
  //   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //   'text/plain'
  // ]
  //
  // if (!allowed.includes(file.mimetype)) {
  //   return cb(
  //     new ApiError(
  //       StatusCodes.UNSUPPORTED_MEDIA_TYPE,
  //       'File type is not allowed'
  //     ),
  //     false
  //   )
  // }

  cb(null, true)
}

/** ---------------------------------------
 * 4. TẠO INSTANCE MULTER
 * -------------------------------------- */
export const uploadAttachment = multer({
  storage: attachmentStorage,
  fileFilter: attachmentFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
})
