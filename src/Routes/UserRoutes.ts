import * as Router from 'koa-router';
import UserController from '../Controllers/UserController';
import { authenticateToken, generateNewToken } from '../Core/Auth/JWT'

const userRouter = new Router({
  prefix: '/user'
})

const _user = new UserController()

userRouter.get('/', authenticateToken, _user.getUsers )
userRouter.get('/2', authenticateToken, _user.getUsers2 )
userRouter.post('/', _user.createUser )
userRouter.post('/multi', _user.createManyUser )
userRouter.post('/login', _user.login)
userRouter.post('/refresh', generateNewToken)

export default userRouter
