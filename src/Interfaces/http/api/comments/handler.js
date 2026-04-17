import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';

class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(req, res, next) {
    try {
      const addCommentUseCase = this._container.getInstance(
        AddCommentUseCase.name,
      );

      const { threadId } = req.params;
      const owner = req.userId;

      const addedComment = await addCommentUseCase.execute(
        req.body,
        threadId,
        owner,
      );

      return res.status(201).json({
        status: 'success',
        data: {
          addedComment,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteCommentHandler(req, res, next) {
    try {
      const deleteCommentUseCase = this._container.getInstance(
        DeleteCommentUseCase.name,
      );

      const { threadId, commentId } = req.params;
      const owner = req.userId;

      const useCasePayload = {
        threadId,
        commentId,
        owner,
      };

      await deleteCommentUseCase.execute(useCasePayload);

      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CommentsHandler;
