import * as Koa from "koa"
import { ObjectId } from 'mongodb'
import DBPool from './Connection'
import { defaultQueryParser } from './Interceptor'
import ResponseBody from './ResponseBody'

interface relation {
  key: string
  schema: any,
  f_key?: string,
  as?: string,
}

class Model {
  private Schema: any
  private UpdateSchema: any
  private coll_name: string
  private relation: relation[]
  private db: any
  private project: any

  constructor(
    schema: any,
    updateSchema: any,
    name: string,
    relation?: relation[],
    project?: any
  ){
    this.Schema = schema
    this.UpdateSchema = updateSchema
    this.coll_name = name
    if(relation && relation.length>0){
      this.relation = relation
    }
    if(project){
      this.project = {
        $project: project
      }
    }
    this.createDBConn()
  }

  createDBConn = async ()=>{
    this.db = await DBPool()
  }

  getDBConnection = async ()=>{
    return await this.db
  }

  getConnection = async ()=>{
    return await this.db.collection(this.coll_name)
  }

  slugify = (str: string)=>{
    return str
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "")
  }

  generateLookup = (populate: string[])=>{
    let lookup = []
    if(populate && populate.length>0){
      for (let i = 0; i < populate.length; i++) {
        const filtered = this.relation.filter((f)=>{
          return f.key == populate[i]
        })
        if(filtered && filtered.length>0){
          if(filtered[0].f_key){
            lookup = [...lookup, {
              $lookup: {
                from: filtered[0].schema,
                localField: populate[i],
                foreignField: filtered[0].f_key,
                as: filtered[0].as? filtered[0].as : filtered[0].schema
              }
            }]
          }else{
            lookup = [...lookup, {
              $lookup: {
                from: filtered[0].schema,
                localField: populate[i],
                foreignField: filtered[0].f_key? filtered[0].f_key: '_id',
                as: filtered[0].as? filtered[0].as : populate[i]
              }
            }]
          }
        }
      }
      if(this.project){
        lookup = [...lookup, this.project]
      }
      return lookup
    }
    if(this.project){
      lookup = [...lookup, this.project]
    }
    return lookup
  }

  create = async (payload: Object)=>{
    const { err, value } = this.Schema.validate(payload)

    if (err) return ResponseBody({ error: 'validation error', ...err }, 'error')
    try {
      return ResponseBody(await this.db.collection(this.coll_name).insertOne({
        ...value
      }), 'create')
    } catch (error) {
      return ResponseBody(error, 'error')
    }
  }

  createMany = async (payload: any)=>{
    const newPayload = []

    for (let i = 0; i < payload.length; i++) {
      const { err, value } = this.Schema.validate(payload[i])
      if (err) return ResponseBody({ error: 'validation error', ...err }, 'error')
      newPayload.push(value)
    }
    try {
      return ResponseBody(await this.db.collection(this.coll_name).insertMany([
        ...newPayload
      ]), 'create')
    } catch (error) {
      console.log(error)
      return ResponseBody(error, 'error')
    }
  }

  find = async (ctx: Koa.Context, payload?: Object, populate?: string[])=>{
    try {
      payload = payload ? payload : {}
      const { limit, skip, sort } = defaultQueryParser(ctx.query)
      const lookup = this.generateLookup(populate)
      return ResponseBody(await this.db.collection(this.coll_name).aggregate([
        { $match: payload },
        ...lookup,
        { $sort: sort },
        { $skip: skip },
        { $limit: limit }
      ]).toArray(), 'array')
    } catch (error) {
      console.log(error)
      return ResponseBody(error, 'error')
    }
  }

  findInt = async (payload?: Object, populate?: string[])=>{
    try {
      const lookup = this.generateLookup(populate)
      return ResponseBody(await this.db.collection(this.coll_name).aggregate([
        { $match: payload },
        ...lookup
      ]).toArray(), 'array')
    } catch (error) {
      console.log(error)
      return ResponseBody(error, 'error')
    }
  }

  findOne = async (payload: Object, populate?: string[], checkPass?: boolean)=>{
    try {
      let lookup = checkPass? [] :this.generateLookup(populate)
      return ResponseBody(await this.db.collection(this.coll_name).aggregate([
        { $match: payload },
        ...lookup
      ]).toArray(), 'array')
    } catch (error) {
      return ResponseBody(error, 'error')
    }
  }

  updateOne = async (id: string, payload: Object)=>{
    const { err, value } = this.UpdateSchema.validate(payload)
    if (err) return ResponseBody({ error: 'validation error', ...err }, 'error')

    try {
      return ResponseBody(await this.db.collection(this.coll_name).updateOne(
        { _id: new ObjectId(id) },
        { $set: value }
      ), 'update')
    } catch (error) {
      return ResponseBody(error, 'error')
    }
  }

  updateMany = async (ids: string[], payload: Object)=>{
    const { err, value } = this.UpdateSchema.validate(payload)
    if (err) return ResponseBody({ error: 'validation error', ...err }, 'error')

    try {
      const id_obj = ids.map((e)=>{
        return new ObjectId(e)
      })
      return ResponseBody(await this.db.collection(this.coll_name).updateMany(
        { _id: { $in: id_obj } },
        { $set: value }
      ), 'update')
    } catch (error) {
      return ResponseBody(error, 'error')
    }
  }

  deleteOne = async (id: string)=>{
    try {
      return ResponseBody(await this.db.collection(this.coll_name).deleteOne({ _id: new ObjectId(id) }), 'delete')
    } catch (error) {
      return ResponseBody(error, 'error')
    }
  }

  deleteMany = async (ids: string[])=>{
    try {
      const id_obj = ids.map((e)=>{
        return new ObjectId(e)
      })
      return ResponseBody(await this.db.collection(this.coll_name).
      deleteMany({ _id: { $in: id_obj } }), 'delete')
    } catch (error) {
      return ResponseBody(error, 'error')
    }
  }

  getCollectionCount = async()=>{
    try {
      return ResponseBody(await this.db.collection(this.coll_name).countDocuments(), 'count')
    } catch (error) {
      return ResponseBody(error, 'error')
    }
  }

  getPrevNext = async(id: string, filter: Object)=>{
    try {
      const prevPost = await this.db.collection(this.coll_name).aggregate([
        { $match: {_id: {$lt: new ObjectId(id) }} },
        { $sort: {_id: -1 }},
        { $limit: 1 },
        { $project: { _id: 1, ...filter } }
      ]).toArray()

      const nextPost = await this.db.collection(this.coll_name).aggregate([
        { $match: {_id: {$gt: new ObjectId(id) }} },
        { $sort: {_id: 1 }},
        { $limit: 1 },
        { $project: { _id: 1, ...filter } }
      ]).toArray()

      const posts = [{ prev: prevPost[0], next: nextPost[0] }]
      return ResponseBody(posts, 'array')
    } catch (error) {
      return ResponseBody(error, 'error')
    }
  }

  updateSchemaValidation = (payload: Object)=>{
    const { err, value } = this.UpdateSchema.validate(payload)
    if (err) return false
    return value
  }

  schemaValidation = (payload: Object)=>{
    const { err, value } = this.Schema.validate(payload)
    if (err) return false
    return value
  }

}

export default Model
