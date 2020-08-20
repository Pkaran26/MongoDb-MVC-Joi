
import { LIMIT, SKIP } from '../Config';

interface Params {
  limit: number,
  skip: number
}

export const defaultQueryParser = (params?: Object): Params =>{
  let temp = {
    limit: LIMIT,
    skip: SKIP
  }
  if(params){
    temp['limit'] = params['limit']? Number(params['limit']) : LIMIT;
    temp['skip'] = params['skip']? Number(params['skip']) : SKIP;
  }
  return temp
}
