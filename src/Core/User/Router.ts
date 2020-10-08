import * as Router from 'koa-router';
import UserModel from './Model';
import { authenticateToken } from '../Auth'

const userRouter = new Router({
  prefix: '/api/user'
})

const _user = new UserModel()

userRouter.post('/signup', _user.signup)
userRouter.get('/verify/:id', _user.verifyEmail)
userRouter.post('/login', _user.login('admin'))
userRouter.post('/ulogin', _user.login('user'))
userRouter.get('/', authenticateToken(['admin']), _user.getUsers)
userRouter.get('/u/:id', authenticateToken(['admin', 'user']), _user.getUser)
userRouter.post('/profile-pic/:id', authenticateToken(['admin', 'user']), _user.uploadPic )
userRouter.get('/count', _user.getCount)

export default userRouter
