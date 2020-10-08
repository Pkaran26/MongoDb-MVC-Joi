import { MongoClient } from 'mongodb'
import {
  MONGO_URL
} from './Config'

const DBPool = async () => {
  const client = await MongoClient.connect(MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  try {
    return client.db('own_mvc')
  } catch (error) {
    console.log(error)
    return null
  }
}

export default DBPool
