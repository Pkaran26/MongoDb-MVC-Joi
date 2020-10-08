import * as Router from 'koa-router';
import BlogModel from './Model';
import { authenticateToken } from '../Core/Auth'

const blogRouter = new Router({
  prefix: '/api/blog'
})

const _blog = new BlogModel()

blogRouter.post('/', authenticateToken(['admin']), _blog.createPost )
blogRouter.get('/', _blog.getPosts )
blogRouter.get('/adm', authenticateToken(['admin']), _blog.getPostsAdm )
blogRouter.get('/blog/:slug', authenticateToken(['admin', 'user']), _blog.getPostBySlug )
blogRouter.put('/:id', authenticateToken(['admin']), _blog.updatePost )
blogRouter.put('/', authenticateToken(['admin']), _blog.updateMultiPost )
blogRouter.post('/delete', authenticateToken(['admin']), _blog.deletePost )
blogRouter.get('/count', _blog.getCount)
blogRouter.get('/np/:id', _blog.getPrevNextPosts)
blogRouter.post('/like', authenticateToken(['user']), _blog.setLike)

export default blogRouter
