import * as fs from 'fs'
import * as util from 'util'
import { BASE } from '../base'

export const uploader = async (file: any)=>{
  if(file){
    const {name, path} = file
    const asyncRename = util.promisify(fs.rename)
    const newPath = `${ BASE }/public/uploads/${ name }`
    await asyncRename(path, newPath)
    return `/uploads/${ name }`
  }else {
    return null
  }
}
