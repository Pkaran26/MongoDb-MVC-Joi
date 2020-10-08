class ResponseBody {
  responseBody = (result: any, type: string)=>{
    // console.log(result)
    switch (type) {
      case 'array':
        return this.arrayResponse(result)
      case 'create':
        return this.createResponse(result)
      case 'update':
        return this.updateResponse(result)
      case 'delete':
        return this.deleteResponse(result)
      case 'count':
        return this.countResponse(result)
      case 'error':
        return this.errorResponse(result)
    }
  }

  private arrayResponse = (result: any)=>{
    if(result && result.length>0){
      return this.responseData(true, {data: result})
    }else if(result && result._id){
      return this.responseData(true, result)
    }
    return this.responseData(false, result)
  }

  private createResponse = (result: any)=>{
    if(result && result.insertedCount){
      return this.responseData(true, { message: 'data inserted', data: result.ops[0] })
    }
    return this.responseData(false, [])
  }

  private updateResponse = (result: any)=>{
    if(result && result.modifiedCount){
      return this.responseData(true, { message: 'data updated' })
    }else if(result && result.modifiedCount == 0){
      return this.responseData(false, { message: 'no changes in data' })
    }
    return this.responseData(false, result)
  }

  private deleteResponse = (result: any)=>{
    if(result && result.deletedCount){
      return this.responseData(true, { message: 'data deleted' })
    }
    return this.responseData(false, result)
  }

  private countResponse = (result: any)=>{
    if(result){
      return this.responseData(true, { count: result })
    }
  }

  private errorResponse = (result: any)=>{
    return this.responseData(false, result)
  }

  private responseData = (status: boolean, data: any)=>{
    return {
      status: status,
      ...data
    }
  }
}

const temp = new ResponseBody()
export default temp.responseBody
