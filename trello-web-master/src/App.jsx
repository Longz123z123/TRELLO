import Board from '~/pages/Boards/_id'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import NotFound from '~/pages/404/NotFound'
import Auth from '~/pages/Auth/Auth'
import AccountVerification from '~/pages/Auth/AccountVerification'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import Settings from '~/pages/Settings/Settings'
import Boards from './pages/Boards'
import ChatBox from './components/Chatbot/ChatBox'
//Cac route nao can dang nhap tai khoan thi moi cho truy cap vao trang do
const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to="/login" replace="true" />

  return <Outlet /> // outlet hien thi ra cac chill route ben trong
}
function App() {
  const currentUser = useSelector(selectCurrentUser)

  return (
    <>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/boards" replace={true} />} />

        <Route element={<ProtectedRoute user={currentUser} />}>
          <Route path="/boards/:boardId" element={<Board />} />
          <Route path="/boards" element={<Boards />} />

          <Route path="/settings/account" element={<Settings />} />
          <Route path="/settings/security" element={<Settings />} />
        </Route>

        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/account/verification" element={<AccountVerification />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {currentUser && <ChatBox />}
    </>
  )
}

export default App
