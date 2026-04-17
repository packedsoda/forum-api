import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import GetThreadUseCase from '../../../../Applications/use_case/GetThreadUseCase.js';

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(req, res, next) {
    try {
      const addThreadUseCase = this._container.getInstance(
        AddThreadUseCase.name,
      );

      const owner = req.userId || req.user?.id;

      if (!owner) {
        throw new Error('Missing authentication');
      }

      const addedThread = await addThreadUseCase.execute(req.body, owner);

      return res.status(201).json({
        status: 'success',
        data: {
          addedThread,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getThreadByIdHandler(req, res, next) {
    try {
      const getThreadUseCase = this._container.getInstance(
        GetThreadUseCase.name,
      );

      const { threadId } = req.params;

      const thread = await getThreadUseCase.execute({ threadId });

      return res.status(200).json({
        status: 'success',
        data: {
          thread,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ThreadsHandler;
