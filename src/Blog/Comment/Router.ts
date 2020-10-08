import * as Router from 'koa-router';
import CommentModel from './Model';
import { authenticateToken } from '../../Core/Auth'

const commentRouter = new Router({
  prefix: '/api/blog-comment'
})

const _comment = new CommentModel()

commentRouter.post('/', authenticateToken(['admin', 'user']), _comment.createComment )
commentRouter.get('/:id', _comment.getComments )
commentRouter.delete('/:id', authenticateToken(['admin', 'user']), _comment.deleteComment )

export default commentRouter
