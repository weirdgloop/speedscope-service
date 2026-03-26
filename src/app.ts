import express from 'express';
import routes from './routes/routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use('/', routes);
app.use(errorHandler);

export default app;
