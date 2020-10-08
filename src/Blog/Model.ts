import * as Koa from "koa";
import * as Joi from "joi";
import Model from '../Core/Model'
import { ObjectId } from 'mongodb'
import { formDataParser } from '../Core/Interceptor'
import { uploader } from '../Core/Uploader'
import CommentModel from './Comment/Model'

class BlogModel extends Model {
  constructor(){
    super(Joi.object({
      create_at: Joi.date().iso().default(new Date()),
      is_published: Joi.boolean().default(false),
      is_free: Joi.boolean().default(false),
      likes: Joi.array().default([]),
      title: Joi.string().required(),
      slug: Joi.string().required(),
      smallBody: Joi.string().required(),
      body: Joi.string().required(),
      author_id: Joi.string().required(),
      category_id: Joi.string().required(),
      reading_time: Joi.number().required(),
      image: Joi.string()
    }),
    Joi.object({
      publish_at: Joi.date().iso().default(new Date()),
      title: Joi.string(),
      slug: Joi.string(),
      smallBody: Joi.string(),
      body: Joi.string(),
      author_id: Joi.string(),
      category_id: Joi.string(),
      image: Joi.string(),
      is_published: Joi.boolean()
    }),
    'blog',
    [
      { key: 'author_id', schema: 'user' },
      { key: 'category_id', schema: 'category' },
      { key: '_id', schema: 'reading_history', f_key: 'blog_id' }
    ],
    { 'author_id.password': 0 }
    )
  }

  createPost = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const requestBody = await formDataParser(ctx)
    const { fields, files } = requestBody
    const path = await uploader(files.image)
    if(fields && files){
      const { title } = fields
      const slug = this.slugify(title)
      const result = await this.create({ ...fields, slug, image: path })
      ctx.body = result
    }else{
      ctx.body = { status: false, message: 'no data found' }
    }
    await next()
  }

  getPosts = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.find(ctx, { is_published: true, ...ctx.request.body }, ['author_id', 'category_id', '_id'])
    ctx.body = result
    await next()
  }

  getPostsAdm = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.find(ctx, { ...ctx.request.body }, ['author_id', 'category_id'])
    ctx.body = result
    await next()
  }

  getPostById = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.findOne(ctx.params.id)
    ctx.body = result
    await next()
  }

  getPostBySlug = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    ctx.status = 200
    const result = await this.findOne({ slug: ctx.params.slug, is_published: true }, ['author_id', 'category_id', '_id'])
    ctx.body = result
    await next()
  }

  updatePost = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    let payload = ctx.request.body
    if(payload.title){
      const slug = this.slugify(payload.title)
      payload = {
        ...payload,
        slug
      }
    }

    const result = await this.updateOne(ctx.params.id, { ...payload })
    ctx.body = result
    await next()
  }

  updateMultiPost = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    let { payload, ids } = ctx.request.body
    if(payload.title){
      const slug = this.slugify(payload.title)
      payload = {
        ...payload,
        slug
      }
    }

    const result = await this.updateMany(ids, { ...payload })
    ctx.body = result
    await next()
  }

  deletePost = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const { ids } = ctx.request.body
    const _comment = new CommentModel()
    const result = await this.deleteMany(ids)
    const r = await _comment.deleteManyComments(ids)
    ctx.body = result
    await next()
  }

  getCount = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.getCollectionCount()
    ctx.body = result
    await next()
  }

  getPrevNextPosts = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.getPrevNext(ctx.params.id, { _id: 1, title: 1, slug: 1, image: 1 })
    ctx.body = result
    await next()
  }

  setLike = async(ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const { _id } = ctx.user
    const { id, like } = ctx.request.body

    const _conn = await this.getConnection()
    let result = null
    if(like){
      result = await _conn.updateOne(
        { _id: new ObjectId(id)},
        { $addToSet: { likes: new ObjectId(_id) } }
      )
    }else{
      result = await _conn.updateOne(
        { _id: new ObjectId(id)},
        { $pull: { likes: new ObjectId(_id) } }
      )
    }
    if(result && result.modifiedCount){
      ctx.body = { status: true }
    }else{
      ctx.body = { status: false }
    }
    await next()
  }
}

export default BlogModel
