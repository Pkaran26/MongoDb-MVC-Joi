import * as Router from 'koa-router';
import ProfileController from '../Controllers/ProfileController';

const profileRouter = new Router({
  prefix: '/profile'
})

const _profile = new ProfileController()

profileRouter.get('/:id', _profile.getProfile )
profileRouter.post('/', _profile.createProfile )


export default profileRouter
