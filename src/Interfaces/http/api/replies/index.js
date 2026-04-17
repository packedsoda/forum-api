import express from 'express';
import RepliesHandler from './handler.js';
import authMiddleware from '../../middleware/auth.js';

const replies = (container) => {
  const router = express.Router();
  const repliesHandler = new RepliesHandler(container);

  router.post(
    '/:threadId/comments/:commentId/replies',
    authMiddleware,
    repliesHandler.postReplyHandler,
  );

  router.delete(
    '/:threadId/comments/:commentId/replies/:replyId',
    authMiddleware,
    repliesHandler.deleteReplyHandler,
  );

  return router;
};

export default replies;
