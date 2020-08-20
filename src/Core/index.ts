import * as Koa from "koa";
import * as logger from "koa-logger";
import * as json from "koa-json";
import * as bodyParser from "koa-bodyparser";
import { requestInterCeptor } from "./RequestMiddleware/Request"

const app = new Koa();

/** Middlewares */
app.use(json());
app.use(logger());
app.use(bodyParser());
app.use(requestInterCeptor);

export default app
