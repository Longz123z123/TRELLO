import { useSearchParams, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import { verifyUserAPI } from '~/apis'

function AccountVerification() {
  // Lấy giá trị email và token từ URL
  let [searchParams] = useSearchParams()
  const { email, token } = Object.fromEntries([...searchParams])
  // Tao một biến state để biết được verify tài khoản thành công chưa
  const [verified, setVerified] = useState(false)
  // Goi api de verify tai khoan
  useEffect(() => {
    if (email && token) {
      verifyUserAPI({ email, token }).then(() => setVerified(true))
    }
  }, [email, token])
  // Neu url sai 0 ton tai 1 trong 2 email va token => 404
  if (!email || !token) {
    return <Navigate to="/404" />
  }
  // Neu chua verify thi hien loading
  if (!verified) {
    return <PageLoadingSpinner caption="Verifing your account..." />
  }
  // Thanh cong
  return <Navigate to={`/login?verifiedEmail=${email}`} />
}

export default AccountVerification
