import NewReply from '../../../Domains/replies/entities/NewReply.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import AddReplyUseCase from '../AddReplyUseCase.js';

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = { content: 'sebuah balasan' };
    const mockThreadId = 'thread-123';
    const mockCommentId = 'comment-123';
    const mockOwner = 'user-123';

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: mockOwner,
    });

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const addedReply = await addReplyUseCase.execute(
      useCasePayload,
      mockThreadId,
      mockCommentId,
      mockOwner,
    );

    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: mockOwner,
      }),
    );
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      mockThreadId,
    );
    expect(
      mockCommentRepository.verifyCommentAvailability,
    ).toHaveBeenCalledWith(mockCommentId);
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      new NewReply({
        content: useCasePayload.content,
      }),
      mockCommentId,
      mockOwner,
    );
  });
});
