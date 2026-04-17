import express from 'express';
import LikesHandler from './handler.js';
import authMiddleware from '../../middleware/auth.js';

const likes = (container) => {
  const router = express.Router();
  const likesHandler = new LikesHandler(container);

  router.put(
    '/:threadId/comments/:commentId/likes',
    authMiddleware,
    likesHandler.putLikeHandler,
  );

  return router;
};

export default likes;
