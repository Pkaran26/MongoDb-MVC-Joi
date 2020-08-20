import * as Router from 'koa-router';
import UserController from '../Controllers/UserController';

const userRouter = new Router({
  prefix: '/'
})

const _user = new UserController()

userRouter.get('/', _user.getUsers )

export default userRouter
