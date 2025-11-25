import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

//Middleware nay se dam nhiem vu quan trong la xac thuc JWT accesstokenn nhan duoc tu phia BE co hop le hay khong

const isAuthorized = async (req, res, next) => {
  // Lay accesstoken nam trong request cookies phia client gui len
  const clientAccestoken = req.cookies?.accessToken
  // Neu nhu clientAcesstoken khong ton tai => error
  if (!clientAccestoken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorize! (token not found)'))
    return
  }
  try {
    //B1: Thuc hien giai ma token xem co hop le hay ko
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccestoken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    // console.log('authMiddlewarea', accessTokenDecoded)
    //B2: Neu hop le thi se phai luu thong tin giai ma vao req, jwtdecoded, de su dung cac tung xu ly sau
    req.jwtDecoded = accessTokenDecoded
    //B3: Cho request di tiep
    next()
  } catch (error) {
    // console.log('authMiddleware', error)
    // Neu accessToken bi het han
    if (error?.message.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token!'))
      return
    }
    //Neu accessToken bi bat cu loi gi
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorize!'))
  }
}

export const authMiddleware = { isAuthorized }
