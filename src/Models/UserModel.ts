import Model from '../Core/Model/Model'
import * as Joi from "joi"

class User extends Model{
  constructor(){
    super(Joi.object({
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      gender: Joi.string().required(),
      birthday: Joi.date().iso(),
      password: Joi.string().required(),
      image: Joi.string(),
      verified: Joi.number().default(0),
      push_token: Joi.string()
    }),
    'User'
    )
  }
  //own function here...
}

export default User
