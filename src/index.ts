import * as Koa from "koa";
// import * as Router from "koa-router";
import * as logger from "koa-logger";
import * as json from "koa-json";
import * as bodyParser from "koa-bodyparser";

import userRouter from './Routes/UserRoutes'

const app = new Koa();
const PORT = 3000;

/** Middlewares */
app.use( json() );
app.use( logger() );
app.use( bodyParser() );

app.listen(PORT, ()=>{
  console.log('server running...')
})

app.use( userRouter.routes() ).use( userRouter.allowedMethods() );
