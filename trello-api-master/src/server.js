/* eslint-disable no-console */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware.'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import cookieParser from 'cookie-parser'
const START_SERVER = () => {
  const app = express()
  //fix cache from disk cua expressjs
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  // cau hinh cookieParser
  app.use(cookieParser())
  // xu ly cors
  app.use(cors(corsOptions))
  // Enable req.body json data
  app.use(express.json())
  app.use('/v1', APIs_V1)
  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    // moi truong production (hien tai sp render)
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`3. Production: Hi ${env.AUTHOR}, Back-end Server is running successfully at Port: ${process.env.PORT}`)
    })
  } else {
    // moi truong local dev
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(`3. Local Dev Hi ${env.AUTHOR}, Back-end Server is running successfully at Host:${env.LOCAL_DEV_APP_HOST} and Port:${env.LOCAL_DEV_APP_PORT}`)
    })
  }

  // Thuc hien cac tac vu cleanup truoc khi stop server
  exitHook(() => {
    console.log('4. Server shutting down...')
    CLOSE_DB()
    console.log('5. Disconnected from MongoDB Cloud Atlas')
  })
}

// Chi khi ket noi vs db thanh cong thi moi start backend
// Immediately-invoked // Anonymous Async Function (IIFE)
;(async () => {
  try {
    console.log('1. Connecting to MongoDB...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
// // Chi khi ket noi vs db thanh cong thi moi start backend
// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB Cloud Atlas'))
//   .then(() => START_SERVER() )
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })
