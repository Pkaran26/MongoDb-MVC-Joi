import app from './Core/App'
import { PORT } from './Core/Config'

import categoryRouter from './Category/Router'
import blogRouter from './Blog/Router'
import commentRouter from './Blog/Comment/Router'

app.use(categoryRouter.routes()).use(categoryRouter.allowedMethods())
app.use(commentRouter.routes()).use(commentRouter.allowedMethods())
app.use(blogRouter.routes()).use(blogRouter.allowedMethods())

app.listen(PORT, ()=>{
  console.log('server running...')
})
