import Model from '../Core/Model/Model'

class User extends Model{
  constructor(){
    super([
      { property: 'firstname', type: 'string', required: true },
      { property: 'lastname', type: 'string', required: true },
      { property: 'email', type: 'email', required: true },
      { property: 'password', type: 'string', required: true }
    ],
    'User'
    )
  }
  //own function here...
}

export default User
