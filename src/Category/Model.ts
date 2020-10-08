import * as Koa from "koa";
import * as Joi from "joi";
import Model from '../Core/Model'

class CategoryModel extends Model {
  constructor(){
    super(Joi.object({
      create_at: Joi.date().iso().default(new Date()),
      category: Joi.string().required()
    }),
    Joi.object({
      category: Joi.string()
    }),
    'category'
    )
  }

  createCategory = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.create({ ...ctx.request.body })
    ctx.body = result
    await next()
  }

  getCategories = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.find(ctx)
    ctx.body = result
    await next()
  }

  updateCategory = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    let payload = ctx.request.body
    const result = await this.updateOne(ctx.params.id, { ...payload })
    ctx.body = result
    await next()
  }

  deleteCategory = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.deleteOne(ctx.params.id)
    ctx.body = result
    await next()
  }

  getCount = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any>=>{
    const result = await this.getCollectionCount()
    ctx.body = result
    await next()
  }
}

export default CategoryModel
