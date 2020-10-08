import * as Koa from "koa"
import { ObjectId } from 'mongodb'
import { LIMIT, SKIP, SORT } from './Config'
import * as formidable from "formidable"

export const requestInterCeptor = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
  let request = ctx.request.body
  if(typeof request == 'object'){
    for (const property in request) {
      try {
        if(property.indexOf('_id')> -1 || property.indexOf('created_by')> -1){
          request[property] = new ObjectId(request[property])
        }
      } catch (error) {}
    }
    ctx.request.body = request
  }else if(request && request.length>0){
    for (let i = 0; i < request.length; i++) {
      for (const property in request[i]) {
        try {
          if(property.indexOf('_id')> -1){
            request[i][property] = new ObjectId(request[i][property])
          }
        } catch (error) {}
      }
    }
    ctx.request.body = request
  }
  await next()
}

interface Params {
  limit: number,
  skip: number,
  sort: any
}

export const defaultQueryParser = (params?: Object): Params =>{
  let temp = {
    limit: LIMIT,
    skip: SKIP,
    sort: SORT
  }
  if(params){
    temp['limit'] = params['limit']? Number(params['limit']) : LIMIT
    temp['skip'] = params['skip']? Number(params['skip']) : SKIP
  }
  return temp
}

export const formDataParser = async (ctx: Koa.Context)=>{
  const form = new formidable.IncomingForm()
  const requestBody: any = await new Promise((resolve, reject) => {
    form.parse(ctx.req, (err, fields, files) => {
      if (err) {
        reject()
        return;
      }
      resolve({ fields, files })
    })
  });

  if(requestBody && requestBody.fields && requestBody.fields.payload){
    try {
      const request = JSON.parse(requestBody.fields.payload)
      if(typeof request == 'object'){
        for (const property in request) {
          try {
            if(property.indexOf('_id')> -1 || property.indexOf('created_by')> -1){
              request[property] = new ObjectId(request[property])
            }
          } catch (error) {}
        }
        requestBody.fields = request
        return requestBody
      }else if(request && request.length>0){
        for (let i = 0; i < request.length; i++) {
          for (const property in request[i]) {
            try {
              if(property.indexOf('_id')> -1){
                request[i][property] = new ObjectId(request[i][property])
              }
            } catch (error) {}
          }
        }
        requestBody.fields = request
        return requestBody
      }
    } catch (error) {
      return requestBody
    }
  }
  return requestBody
}
