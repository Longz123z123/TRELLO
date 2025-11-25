import JWT from 'jsonwebtoken'

// userInfo: Thông tin muốn đính kèm vào token (id, email, role…).
// secretSignature: Chuỗi ký bí mật để ký token (thường gọi là secretKey hoặc privateKey).
// tokenLife: Thời gian sống của token (ví dụ: "15m", "7d"…).
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    //
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

const verifyToken = async (token, secretSignature) => {
  try {
    //
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
