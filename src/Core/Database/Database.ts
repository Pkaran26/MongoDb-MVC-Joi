import { MongoClient } from 'mongodb'
import { MONGODB_URL } from '../Config'

const DBPool = async () => {
  const client = await MongoClient.connect(
    MONGODB_URL,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }
  )
  try {
    return client.db('lb4_blog')
  } catch (error) {
    console.log(error)
    return null
  }
}

export default DBPool
