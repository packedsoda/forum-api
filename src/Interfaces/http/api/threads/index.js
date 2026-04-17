import express from 'express';
import ThreadsHandler from './handler.js';
import authMiddleware from '../../middleware/auth.js';

const threads = (container) => {
  const router = express.Router();
  const threadsHandler = new ThreadsHandler(container);

  router.post('/', authMiddleware, threadsHandler.postThreadHandler);

  router.get('/:threadId', threadsHandler.getThreadByIdHandler);

  return router;
};

export default threads;
