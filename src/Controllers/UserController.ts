import User from '../Models/UserModel';
import * as Koa from 'koa';
import { defaultQueryParser } from '../Core/RequestMiddleware/Request'

class UserController {
  constructor(private _user: User = new User()){
  }

  getUsers = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
    const payload = ctx.request.body
    const { limit, skip } = defaultQueryParser(ctx.query)
    const result: any[] = await this._user.find(payload, limit, skip)
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
