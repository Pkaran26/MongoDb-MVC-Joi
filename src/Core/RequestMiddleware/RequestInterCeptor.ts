import * as Koa from "koa";
import { ObjectId } from 'mongodb';

export const requestInterCeptor = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
  let request = ctx.request.body
  if(typeof request == 'object'){
    for (const property in request) {
      if(property.indexOf('_id')> -1){
        request[property] = new ObjectId(request[property])
      }
    }
    ctx.request.body = request
  }else if(request.isArray()){
    for (let i = 0; i < request.length; i++) {
      for (const property in request[i]) {
        if(property.indexOf('_id')> -1){
          request[i][property] = new ObjectId(request[i][property])
        }
      }
    }
    ctx.request.body = request
  }
  await next();
}
