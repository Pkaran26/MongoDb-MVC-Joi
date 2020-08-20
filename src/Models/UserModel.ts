import Model from '../Core/Model/Model'

class User extends Model{
  constructor(){
    super([
      { property: 'firstname', type: 'string', required: true },
      { property: 'lastname', type: 'string', required: true },
      { property: 'email', type: 'email', required: true, unique: true },
      { property: 'password', type: 'string', required: true }
    ], 'User')
  }
  //own function here...

  tryAggregate = async ()=>{
    const db: any = await this.getDBConnection()
    return await db.aggregate([]).toArray()
  }
}

export default User
