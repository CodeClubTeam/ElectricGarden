import express, { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import * as lessonsApi from './routes/lessons';

export const api = express.Router();

const middleware = (handler: RequestHandler) => asyncHandler(handler);

api.get('/lessons', middleware(lessonsApi.getList));
api.put('/lessons/:name', middleware(lessonsApi.put));
api.delete('/lessons/:name', middleware(lessonsApi.remove));
