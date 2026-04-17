import ToggleLikeCommentUseCase from '../../../../Applications/use_case/ToggleLikeCommentUseCase.js';

class LikesHandler {
  constructor(container) {
    this._container = container;
    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(req, res, next) {
    try {
      const toggleLikeCommentUseCase = this._container.getInstance(
        ToggleLikeCommentUseCase.name,
      );

      const { threadId, commentId } = req.params;
      const owner = req.userId;

      const useCasePayload = {
        threadId,
        commentId,
        owner,
      };

      await toggleLikeCommentUseCase.execute(useCasePayload);

      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LikesHandler;
