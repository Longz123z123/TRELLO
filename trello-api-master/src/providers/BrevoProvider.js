/**
 * Có thể xem thêm phần docs cấu hình theo từng ngôn ngữ khác nhau tùy dự án ở
 * https://brevo.com
 * Với Nodejs thì tốt nhất cứ lên github repo của bọn nó là nhanh nhất:
 * https://github.com/getbrevo/brevo-node
 */
const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
const apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  //Khoi tao  sendSmtpEmail voi nhung thong tin can thiet
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
  //Tài khoản gửi mail: la email tao tk tren Brevo
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }
  // ~ tai khoan nhan mail
  sendSmtpEmail.to = [{ email: recipientEmail }]
  // Tieu de cua email:
  sendSmtpEmail.subject = customSubject
  // Noi dung email dang html
  sendSmtpEmail.htmlContent = htmlContent
  // Goi hanh dong gui mail
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}
export const BrevoProvider = {
  sendEmail
}
