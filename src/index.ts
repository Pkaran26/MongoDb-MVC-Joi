import app from './Core/index'
import userRouter from './Routes/UserRoutes'

const PORT = 3000;

app.listen(PORT, ()=>{
  console.log('server running...')
})

app.use( userRouter.routes() ).use( userRouter.allowedMethods() );
