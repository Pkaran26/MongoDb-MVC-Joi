import * as Koa from "koa";
import * as Joi from "joi";
import Model from '../Model'
import { genHash, Token, DirectToken, createToken, tokenVerify } from '../Auth'
import { formDataParser } from '../Interceptor'
import { uploader } from '../Uploader'
import { ObjectId } from 'mongodb'

class UserModel extends Model {
  private redirect_uri: Object = {
    // admin: 'http://localhost:3001/api/user/s/callback',
    user: 'http://localhost:8080/user/callback/'
  }

  constructor(){
    super(Joi.object({
      date_added: Joi.date().iso().default(new Date()),
      email_verified: Joi.boolean().default(false),
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      userRole:  Joi.string().valid('user').required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      profile_pic: Joi.string().default('')
    }),
    Joi.object({
      firstname: Joi.string(),
      lastname: Joi.string(),
      email: Joi.string().email(),
      password: Joi.string(),
      profile_pic: Joi.string(),
      email_verified: Joi.boolean()
    }),
    'user', null,
    { password: 0 }
    )
  }

  signup = async(ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const { firstname, lastname, email, password } = ctx.request.body
    const result: any = await this.findOne({ email }, null, true)
    if(result && result.status){
      ctx.body = { status: false, message: 'email is already exist'}
      return await next()
    }
    const hash = await genHash(password)
    const result2 = await this.create({ firstname, lastname, email, password: hash})
    ctx.body = result2
    await next()
  }

  verifyEmail = async (ctx: any, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.updateOne(ctx.params.id, { email_verified: true })
    ctx.body = result
    await next()
  }


  login = (user_type: string)=>{
    return async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
      const { email, password } = ctx.request.body
      const result: any = await this.findOne({ email }, null, true)

      if(result && result.status && result.data[0].userRole == user_type){
        const userDetail = await Token(password, result)
        ctx.body = { ...userDetail }
      }else{
        ctx.body = { status: false, message: 'invalid email or password' }
      }

      await next()
    }
  }

  uploadPic = async (ctx: any, next: ()=> Promise<any>): Promise<any>=>{
    const requestBody = await formDataParser(ctx)
    const { files } = requestBody
    const path = await uploader(files.file)
    if(path){
      const result = await this.updateOne(ctx.params.id, { profile_pic: path })
      ctx.body = result
    }else{
      ctx.body = { status: false, message: 'no image found' }
    }
    await next()
  }

  getUsers = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    let payload = ctx.request.body
    // if(payload && payload.userRole && payload.userRole == 'admin'){
    //   payload = {
    //     ...payload,
    //     userRole: { $ne: 'admin' }
    //   }
    // }
    const result = await this.find(ctx, { ...payload, userRole: { $ne: 'admin' } })
    ctx.body = result
    await next()
  }

  getUser = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.find(ctx, { _id: new ObjectId(ctx.params.id)})
    ctx.body = result
    await next()
  }

  getUsersInt = async (payload?: Object): Promise<any>=>{
    return await this.findInt({ ...payload, userRole: { $ne: 'admin' } })
  }

  getCount = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.getCollectionCount()
    ctx.body = result
    await next()
  }
}

export default UserModel
