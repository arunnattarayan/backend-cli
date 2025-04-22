"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAppTemplate = generateAppTemplate;
function generateAppTemplate() {
    return `import express from 'express';
  import cors from 'cors';
  import dotenv from 'dotenv';
  import router from './routes'; // 💡 Auto-imports all grouped routes
  import { connectDB } from './config/db';
  import {errorHandler, notFoundHandler} from './middlewares/errorHandler'
  dotenv.config();
  connectDB();
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api', router); // ⛓️ All route modules mounted under /api
  app.use(notFoundHandler)
  app.use(errorHandler)
  export default app;`;
}
