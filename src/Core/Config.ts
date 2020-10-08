import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/.env' })

export const MONGO_URL = process.env.MONGO_URL

export const SECRET = process.env.SECRET
export const REFRESH_SECRET = process.env.REFRESH_SECRET

export const EXPIRES_IN = '7h'
export const REF_EXPIRES_IN = '7h'

export const LIMIT = 10
export const SKIP = 0
export const SORT = {_id: -1}

export const PORT = 3001
export const FRONT_PORT = 8081

export const SALT_ROUND = 10
