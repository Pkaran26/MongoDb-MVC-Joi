import User from '../Models/UserModel';
import * as Koa from 'koa';

class UserController {
  constructor(private _user: User = new User()){
  }

  getUsers = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
    const payload = ctx.request.body
    const result: any[] = await this._user.find(payload)
    ctx.body = result
    await next()
  }

  createUser = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
    const payload = ctx.request.body
    const result: any = await this._user.create(payload)
    ctx.body = result
    await next()
  }

  createManyUser = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
    const payload = ctx.request.body
    const result: any = await this._user.createMany(payload)
    ctx.body = result
    await next()
  }
}

export default UserController
