import DBPool from '../../Config/database';
import * as Joi from "joi"

const DEFAULT = {
  date_added: Joi.date().iso().default(new Date()),
  date_modified: Joi.date().iso().default(new Date())
}

class Model {
  private _validator: Joi.Schema;
  private _dbPool: any;
  private coll_name: string;

  constructor(validator: Joi.Schema, coll_name: string) {
    this._validator = validator;
    this.coll_name = coll_name;
    this.setDbConnection()
  }

  async setDbConnection() {
    try {
      this._dbPool = await DBPool();
    } catch (error) {
      this._dbPool = null
    }
  }

  getDBConnection() {
    return this._dbPool
  }

  async create(payload: Object) {
    const { value } = this._validator.validate(payload)
    if (!value) return { error: 'validation error' }
    try {
      return await this._dbPool.collection(this.coll_name).insertOne({
        ...value,
        ...DEFAULT
      })
    } catch (error) {
      return error
    }
  }

  async find() {
    try {
      return await this._dbPool.collection(this.coll_name).find({}).toArray()
    } catch (error) {
      return error
    }
  }
}

export default Model
