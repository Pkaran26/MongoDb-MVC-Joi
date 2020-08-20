import Model from '../Core/Model/Model'

class Profile extends Model {
  constructor(){
    super([
      { property: 'user_id', type: 'string', required: true, ref: 'User' },
      { property: 'dob', type: 'date', required: true }
    ], 'Profile')
  }
  //own function here...
}

export default Profile
