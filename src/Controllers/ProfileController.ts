import Profile from '../Models/ProfileModel';
import * as Koa from 'koa';
import { ObjectId } from 'mongodb';

class ProfileController {
  constructor(private _profile: Profile = new Profile()){}

  getProfile = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
    const result: any[] = await this._profile.findOne({ _id: new ObjectId(ctx.params.id)}, ['user_id'])
    ctx.body = result
    await next()
  }

  createProfile = async (ctx: Koa.Context, next: ()=> Promise<any>): Promise<any> => {
    const payload = ctx.request.body
    const result: any = await this._profile.create(payload)
    ctx.body = result
    await next()
  }
}

export default ProfileController
