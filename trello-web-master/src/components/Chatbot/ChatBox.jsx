import { useState, useRef, useEffect } from 'react'
import { askChatbotAPI } from '~/apis'
import './chatbox.css'

function ChatBox() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  // 👉 Tạo ref cho khu vực hiển thị tin nhắn
  const messagesEndRef = useRef(null)

  // 👉 Auto scroll xuống cuối khi messages thay đổi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMsg = { sender: 'user', text: input }
    setMessages((prev) => [...prev, userMsg])

    try {
      const res = await askChatbotAPI(input)
      const botMsg = { sender: 'bot', text: res.reply }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Chatbot lỗi hoặc backend không phản hồi.' }])
    }

    setInput('')
  }

  return (
    <div className="chatbox-wrapper">
      {!open && (
        <button className="chat-toggle-btn" onClick={() => setOpen(true)}>
          💬
        </button>
      )}

      {open && (
        <div className="chatbox animated-popup">
          <div className="chatbox-header">
            <span className="chatbot-title">🤖 Job Assistant</span>
            <button className="close-btn" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div className="chatbox-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}

            {/* 👉 Nơi dùng để scroll xuống */}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="chatbox-footer">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập câu hỏi..." onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatBox
