import * as Joi from "joi";
import { ObjectId } from 'mongodb';
import DBPool from '../Database/Database';

const DEFAULT = {
  date_added: Joi.date().iso().default(new Date()),
  date_modified: Joi.date().iso().default(new Date())
}

class Model {
  private properties: any[];
  private unique: any[];
  private _validator: Joi.Schema;
  private _update_validator: Joi.Schema;
  private _dbPool: any;
  private coll_name: string;

  constructor(properties: any[], coll_name: string) {
    this.properties = properties
    this.coll_name = coll_name;
    this.createSchema()
    this.setUnique()
    this.setDbConnection()
  }

  private createSchema() {
    let temp = DEFAULT
    let updateTemp = {}
    this.properties.map((e) => {
      temp = {
        ...temp,
        [e.property]: this.returnSchemaType(e.type, e.required)
      }
      updateTemp = {
        ...updateTemp,
        [e.property]: this.returnSchemaType(e.type, false)
      }
    })
    this._validator = Joi.object(temp);
    this._update_validator = Joi.object(updateTemp);
  }

  private returnSchemaType(type: string, required: boolean) {
    if (type === 'string') {
      return required ? Joi.string().required() : Joi.string()
    } else if (type === 'email') {
      return required ? Joi.string().email().required() : Joi.string().email()
    } else {
      return required ? Joi.string().required() : Joi.string()
    }
  }

  private validateJson(payload: Object, type?: boolean) {
    const { value } = type ? this._update_validator.validate(payload) : this._validator.validate(payload)
    return value ? value : { error: 'validation error' }
  }

  private async setDbConnection() {
    try {
      this._dbPool = await DBPool();
    } catch (error) {
      this._dbPool = null
    }
  }

  private setUnique() {
    let unique = []
    this.properties.map((e) => {
      if (e.unique == true) {
        unique = [...unique, e.property]
      }
    })
    this.unique = unique
  }

  private async checkUnique(payload: Object): Promise<any>{
    if (this.unique.length > 0) {
      let value = {}
      for (let i = 0; i < this.unique.length; i++) {
        value = {
          ...value,
          [this.unique[i]]: payload[this.unique[i]]
        }
      }
      const result = await this.find(value)
      return result && result.length>0? false : true
    }
    return true
  }

  async getDBConnection() {
    return await this._dbPool.collection(this.coll_name)
  }

  async create(payload: Object) {
    const value = this.validateJson(payload)
    if (!value) return { error: 'validation error' }
    const flg: boolean = await this.checkUnique(value)
    if(flg){
      try {
        return await this._dbPool.collection(this.coll_name).insertOne({
          ...value
        })
      } catch (error) {
        console.log(error)
        return error
      }
    } else {
      return { status: false, message: 'data already exist', keys: this.unique }
    }
  }

  async createMany(payload: any) {
    let finalPayload = []
    for (let i = 0; i < payload.length; i++) {
      const value = this.validateJson(payload[i])
      if (!value) return { error: 'validation error' }
      finalPayload[i] = value
    }
    try {
      return await this._dbPool.collection(this.coll_name).insertMany(finalPayload)
    } catch (error) {
      return error
    }
  }

  async find(payload?: Object, limit?: number, skip?: number, populate?: string[]) {
    try {
      payload = payload ? payload : {}
      limit = limit ? limit : 10
      skip = skip ? skip : 0
      const lookup = this.generateLookup(populate)
      return await this._dbPool.collection(this.coll_name).aggregate([
        { $match: payload },
        ...lookup,
        { $limit: limit },
        { $skip: skip }
      ]).toArray()
    } catch (error) {
      return error
    }
  }

  generateLookup = (populate: string[]): any[]=>{
    let lookup = []
    for (let i = 0; i < populate.length; i++) {
      for (let j = 0; j < this.properties.length; j++) {
        if(this.properties[j].property == populate[i] && this.properties[j].ref){
          lookup = [...lookup, {
            $lookup: {
              from: this.properties[j].ref,
              localField: populate[i],
              foreignField: '_id',
              as: populate[i]
            }
          }]
        }
      }
    }
    console.log(lookup)
    return lookup
  }

  async findOne(payload: Object, populate?: string[]) {
    try {
      const lookup = this.generateLookup(populate)
      return await this._dbPool.collection(this.coll_name).aggregate([
        { $match: payload },
        ...lookup
      ]).toArray()
    } catch (error) {
      return error
    }
  }

  async findById(id: any) {
    try {
      id = new ObjectId(id)
      return await this._dbPool.collection(this.coll_name).findById(id)
    } catch (error) {
      return error
    }
  }

  async updateOne(id: string, payload: Object) {
    const value = this.validateJson(payload, true)
    if (!value) return { error: 'validation error' }
    try {
      return await this._dbPool.collection(this.coll_name).updateOne(
        { _id: new ObjectId(id) },
        { $set: value }
      )
    } catch (error) {
      return error
    }
  }

  async updateMany(filter: Object, payload: Object) {
    const filtered = this.validateJson(filter)
    const value = this.validateJson(payload)
    if (!value || !filtered) return { error: 'validation error' }
    try {
      return await this._dbPool.collection(this.coll_name).updateMany(
        filter,
        { $set: value }
      )
    } catch (error) {
      return error
    }
  }

  async deleteOne(id: string) {
    try {
      return await this._dbPool.collection(this.coll_name).deleteOne({ _id: new ObjectId(id) })
    } catch (error) {
      return error
    }
  }

  async deleteMany(payload: Object) {
    const value = this.validateJson(payload)
    if (!value) return { error: 'validation error' }
    try {
      return await this._dbPool.collection(this.coll_name).deleteMany(value)
    } catch (error) {
      return error
    }
  }
}

export default Model
