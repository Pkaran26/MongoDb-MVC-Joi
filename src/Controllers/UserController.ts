import User from '../Models/UserModel';
import * as Koa from 'koa';
import { defaultQueryParser } from '../Core/RequestMiddleware/Request'
import { createToken, createRefToken } from '../Core/Auth/JWT'

class UserController {
  constructor(private _user: User = new User()){
  }

  login = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
    const { email, password } = ctx.request.body
    if(!email || !password){
      ctx.body = { error: 'email or password is not found!'}
      return await next()
    }
    const result: any = await this._user.findOne({ email, password })
    if(result && result._id){
      const { _id, firstname, lastname } = result
      const token = createToken({ _id, firstname, lastname })
      const refresh_token =  createRefToken({ _id, firstname, lastname })
      ctx.body = {
        status: true,
        token,
        refresh_token,
        user: result
      }
    }else{
      ctx.body = { status: false, error: 'invalid email or password' }
    }
    await next()
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

  getUsers2 = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
    const result: any[] = await this._user.tryAggregate()
    ctx.body = result
    await next()
  }

}

export default UserController
