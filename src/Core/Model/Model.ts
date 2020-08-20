import * as Joi from "joi";
import { ObjectId } from 'mongodb';
import DBPool from '../Database/Database';

const DEFAULT = {
  date_added: Joi.date().iso().default(new Date()),
  date_modified: Joi.date().iso().default(new Date())
}

class Model {
  private properties: any[];
  private _validator: Joi.Schema;
  private _update_validator: Joi.Schema;
  private _dbPool: any;
  private coll_name: string;

  constructor(properties: any[], coll_name: string) {
    this.properties = properties
    this.coll_name = coll_name;
    this.createSchema()
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

  private validateJson(payload: Object, type?: boolean){
    const { value } = type? this._update_validator.validate(payload) : this._validator.validate(payload)
    return value? value : { error: 'validation error' }
  }

  private async setDbConnection() {
    try {
      this._dbPool = await DBPool();
    } catch (error) {
      this._dbPool = null
    }
  }

  async getDBConnection() {
    return await this._dbPool
  }

  async create(payload: Object) {
    const value = this.validateJson(payload)
    console.log(value)
    if (!value) return { error: 'validation error' }
    try {
      return await this._dbPool.collection(this.coll_name).insertOne({
        ...value
      })
    } catch (error) {
      console.log(error)
      return error
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

  async find(payload?: Object, limit?: number, skip?: number) {
    try {
      payload = payload ? payload : {}
      limit = limit ? limit : 10
      skip = skip ? skip : 0
      return await this._dbPool.collection(this.coll_name).aggregate([
        { $match: payload },
        { $limit: limit },
        { $skip: skip }
      ]).toArray()
    } catch (error) {
      return error
    }
  }

  async findOne(payload: Object) {
    try {
      return await this._dbPool.collection(this.coll_name).findOne(payload)
    } catch (error) {
      return error
    }
  }

  async findById(id: any) {
    try {
      id = new ObjectId(id)
      return await this._dbPool.collection(this.coll_name).findOne(id)
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
    if (!value || !filtered ) return { error: 'validation error' }
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
