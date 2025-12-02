import express from 'express'
import Groq from 'groq-sdk'
import { chatbotRules } from '~/data/chatbotRules'

const Router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

Router.post('/ask', async (req, res) => {
  try {
    const { message } = req.body
    if (!message) return res.status(400).json({ error: 'Message is required' })

    const lowerMsg = message.toLowerCase()

    // ===========================
    // 1. CHECK RULES
    // ===========================
    for (const rule of chatbotRules) {
      // 1.1. Match keywords (includes)
      if (rule.keywords?.some((kw) => lowerMsg.includes(kw.toLowerCase().trim()))) {
        return res.status(200).json({ reply: rule.answer })
      }

      // 1.2. Match regex (very flexible)
      if (rule.regex?.some((rgx) => rgx.test(lowerMsg))) {
        return res.status(200).json({ reply: rule.answer })
      }
    }

    // ===========================
    // 2. AI FALLBACK
    // ===========================
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `
Bạn là trợ lý AI cho hệ thống quản lý công việc giống Trello.

Bạn được phép trả lời đúng 2 nhóm nội dung:

1️⃣ NỘI DUNG LIÊN QUAN ĐẾN HỆ THỐNG:
- Board / Column / Card
- Workflow
- Thành viên / Phân quyền
- Notification / Invitation

2️⃣ LÝ THUYẾT CÔNG VIỆC:
- Công việc, nhiệm vụ, deadline
- Dự án, quản lý công việc
- Teamwork, báo cáo, quy trình làm việc

Nếu câu hỏi KHÔNG thuộc 2 nhóm trên:
"Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến công việc và hệ thống quản lý công việc Trello."
`
        },
        { role: 'user', content: message }
      ]
    })

    return res.status(200).json({
      reply: completion.choices[0].message.content
    })
  } catch (error) {
    console.error('🔥 GROQ ERROR:', error)
    return res.status(500).json({
      error: error.message,
      details: error.response?.data || null
    })
  }
})

export const chatbotRoute = Router
