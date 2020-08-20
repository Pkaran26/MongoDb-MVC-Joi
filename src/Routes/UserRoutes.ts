import * as Router from 'koa-router';
import UserController from '../Controllers/UserController';

const userRouter = new Router({
  prefix: '/user'
})

const _user = new UserController()

userRouter.get('/', _user.getUsers )
userRouter.post('/', _user.createUser )
userRouter.post('/multi', _user.createManyUser )

export default userRouter
