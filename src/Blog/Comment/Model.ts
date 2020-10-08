import * as Koa from "koa";
import * as Joi from "joi";
import Model from '../../Core/Model'
import { ObjectId } from 'mongodb'

class CommentModel extends Model {
  constructor(){
    super(Joi.object({
      create_at: Joi.date().iso().default(new Date()),
      blog_id: Joi.string().required(),
      user_id: Joi.string().required(),
      comment: Joi.string().required()
    }),
    Joi.object({
      comment: Joi.string()
    }),
    'blogComment',
    [
      { key: 'blog_id', schema: 'blog' },
      { key: 'user_id', schema: 'user' }
    ],
    { 'user_id.password': 0 }
    )
  }

  createComment = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.create({ ...ctx.request.body })
    ctx.body = result
    await next()
  }

  getComments = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.find(ctx, { blog_id: new ObjectId(ctx.params.id) }, (['blog_id', 'user_id']))
    ctx.body = result
    await next()
  }

  deleteComment = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.deleteOne(ctx.params.id)
    ctx.body = result
    await next()
  }

  deleteManyComments = async (ids: any[]): Promise<any>=>{
    try {
      const id_obj = ids.map((e)=>{
        return new ObjectId(e)
      })
      const _conn = await this.getConnection()
      return await _conn.deleteMany({ blog_id: { $in: id_obj } })
    } catch (error) {
      return null
    }
  }
}

export default CommentModel
