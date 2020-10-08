import * as Router from 'koa-router';
import CategoryModel from './Model';
import { authenticateToken } from '../Core/Auth'

const categoryRouter = new Router({
  prefix: '/api/category'
})

const _category = new CategoryModel()

categoryRouter.post('/', authenticateToken(['admin']), _category.createCategory )
categoryRouter.get('/', _category.getCategories )
categoryRouter.put('/:id', authenticateToken(['admin']), _category.updateCategory )
categoryRouter.delete('/:id', authenticateToken(['admin']), _category.deleteCategory )
categoryRouter.get('/count', _category.getCount)
export default categoryRouter
