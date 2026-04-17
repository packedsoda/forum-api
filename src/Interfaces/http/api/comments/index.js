import express from 'express';
import CommentsHandler from './handler.js';
import authMiddleware from '../../middleware/auth.js';

const comments = (container) => {
  const router = express.Router();
  const commentsHandler = new CommentsHandler(container);

  router.post(
    '/:threadId/comments',
    authMiddleware,
    commentsHandler.postCommentHandler,
  );

  router.delete(
    '/:threadId/comments/:commentId',
    authMiddleware,
    commentsHandler.deleteCommentHandler,
  );

  return router;
};

export default comments;
