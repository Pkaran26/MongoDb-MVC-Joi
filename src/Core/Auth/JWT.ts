import * as Koa from 'koa';
import * as jwt from 'jsonwebtoken';
import { SECRET, REFRESH_SECRET, EXPIRES_IN, REF_EXPIRES_IN } from '../Config'

export const authenticateToken = async (ctx:Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
  if(ctx.request.header && ctx.request.header.authorization){
    const token = ctx.request.header.authorization.split(' ')[1]
    if(!token){
      ctx.status = 401
      ctx.body = { status: 'invalid token' }
      return null;
    }
    try {
      const data = jwt.verify(token, SECRET);
      ctx.user = data
      await next()
    } catch (error) {
      console.log(error)
      ctx.status = 401
      ctx.body = { status: 'invalid token' }
    }
  }else{
    ctx.status = 401
    ctx.body = { status: 'no token provided' }
  }
}

export const generateNewToken = async (ctx:Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
  const token = ctx.request.body.refresh_token;

  const user: any = jwt.verify(token, REFRESH_SECRET);
  const { _id, firstname, lastname } = user

  const newToken = createToken({ _id, firstname, lastname })
  const newRefToken = createRefToken({ _id, firstname, lastname })
  ctx.body = {
    token: newToken,
    refresh_token: newRefToken
  }
  await next()
}

export const createToken = (data: Object): string=>{
  return jwt.sign(data, SECRET, { expiresIn: EXPIRES_IN });
}

export const createRefToken = (data: Object): string=>{
  return jwt.sign(data, REFRESH_SECRET, { expiresIn: REF_EXPIRES_IN });
}
