import express from 'express';
import routes from './routes/routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import path from "node:path";
import {fileURLToPath} from "node:url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uiPath = path.join(__dirname, '..', '..', 'ui');
app.use(express.static(uiPath));
app.use('/', routes);
app.use(errorHandler);

export default app;
