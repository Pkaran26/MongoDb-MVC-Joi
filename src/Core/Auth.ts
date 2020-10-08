import * as Koa from 'koa';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt'
import {
  SECRET, REFRESH_SECRET,
  EXPIRES_IN, REF_EXPIRES_IN,
  SALT_ROUND
} from './Config'

export interface User {
  _id: string
  firstname: string
  lastname: string
  password: string
}

export interface UserToken {
  _id: string
  firstname: string
  lastname: string
  userRole: string
}

export const tokenVerify = async (token: string): Promise<any>=>{
  return new Promise((e:any, r:any)=>{
   jwt.verify(token, SECRET, (err:any, data:any) => err ? r(null) : e(data))
  })
}

export const authenticateToken = (type: string[]) =>{
  return async (ctx:Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    if(ctx.request.header && ctx.request.header.authorization){
      const token = ctx.request.header.authorization.split(' ')[1]
      if(!token){
        ctx.status = 401
        ctx.body = { status: false, message: 'invalid token 1' }
        return null
      }
      try {
        const data:any = await tokenVerify(token)

        if(!data){
          ctx.body = { status: false, message: 'token expired' }
          return null
        }

        if(!type.includes(data.userRole)){
          ctx.body = { status: false, message: 'invalid token 2' }
          return null
        }
        ctx.user = data
        return await next()
      } catch (error) {
        console.log(error)
        ctx.status = 401
        ctx.body = { status: false, message: 'invalid token 3' }
        return null
      }
    }else{
      ctx.status = 401
      ctx.body = { status: false, message: 'no token provided' }
      return null
    }
  }
}

export const generateNewToken = async (ctx:Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
  const { refresh_token } = ctx.request.body;

  const user: any = jwt.verify(refresh_token, REFRESH_SECRET);
  const newToken = createToken(user)
  const newRefToken = createRefToken(user)
  ctx.body = {
    token: newToken,
    refresh_token: newRefToken
  }
  await next()
}

export const createToken = (data: UserToken): string=>{
  return jwt.sign(data, SECRET, { expiresIn: EXPIRES_IN });
}

const createRefToken = (data: UserToken): string=>{
  return jwt.sign(data, REFRESH_SECRET, { expiresIn: REF_EXPIRES_IN });
}

export const genHash = async (password: string): Promise<string>=>{
  return await bcrypt.hash(password, SALT_ROUND)
}

export const compareHash = async(dbPassword: string, hash: string): Promise<boolean>=>{
  return await bcrypt.compare(hash, dbPassword)
}

const errorMessage: Object = {
  status: false,
  message: 'email or password did not matched'
}

export const Token = async (password: string, data: any)=>{
  try {
    if(data && data.data.length>0){
      const dbPassword = data.data[0].password
      const compare: boolean = await compareHash(dbPassword, password)

      if(compare){
        const { _id, firstname, lastname, email, profile_pic, userRole, date_added, email_verified } = data.data[0]
        const token = createToken({ _id, firstname, lastname, userRole })
        const refresh_token = createRefToken({ _id, firstname, lastname, userRole })

        return {
          status: true, data: { _id, firstname, lastname, email, profile_pic, date_added, email_verified }, token, refresh_token, userRole
        }
      }else {
        return errorMessage
      }
    }
  } catch (error) {
    return errorMessage
  }
}

export const DirectToken = async (data: any)=>{
  try {
    const { _id, firstname, lastname, email, profile_pic, userRole, date_added, email_verified } = data.data
    const token = createToken({ _id, firstname, lastname, userRole })
    const refresh_token = createRefToken({ _id, firstname, lastname, userRole })

    return {
      status: true, data: { _id, firstname, lastname, email, profile_pic, date_added, email_verified }, token, refresh_token, userRole
    }
  } catch (error) {
    return errorMessage
  }
}

// export const Token = async (password: string, data: any, type: string)=>{
//   try {
//     if(data && data.data.length>0){
//       const dbPassword = data.data[0].password
//       const compare: boolean = await compareHash(dbPassword, password)
//
//       if(compare){
//         const { _id, firstname, lastname, email } = data.data[0]
//         const token = createToken({ _id, firstname, lastname, type })
//         const refresh_token = createRefToken({ _id, firstname, lastname, type })
//
//         return {
//           status: true, data: { _id, firstname, lastname, email }, token, refresh_token, type
//         }
//       }else {
//         return errorMessage
//       }
//     }
//   } catch (error) {
//     return errorMessage
//   }
// }
