import User from '../Models/UserModel';
import * as Koa from 'koa';

class UserController {
  constructor(private _user: User = new User()){
  }

  getUsers = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
    // const payload = ctx.request.body
    const result: any[] = await this._user.find()
    ctx.body = result
    await next()
  }
}

export default UserController
