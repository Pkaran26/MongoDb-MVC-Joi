import * as Koa from "koa"
import * as logger from "koa-logger"
import * as json from "koa-json"
import * as serve from "koa-static"
import * as  bodyParser from 'koa-bodyparser'
import * as cors from '@koa/cors'
import * as helmet from 'koa-helmet'

import { BASE } from '../base'
import userRouter from './User/Router'
import { requestInterCeptor } from './Interceptor'

const app = new Koa()

app.use(json())
app.use(logger())
app.use(bodyParser())
app.use(serve(`${BASE}/public`))
app.use(cors())
app.use(helmet())
app.use(requestInterCeptor)
app.use(userRouter.routes()).use(userRouter.allowedMethods())

export default app
