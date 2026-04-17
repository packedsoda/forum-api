import LikeRepository from '../../../Domains/likes/LikeRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';
import { vi } from 'vitest';

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrating the add like action correctly when user has not liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkIsLiked = vi
      .fn()
      .mockImplementation(() => Promise.resolve(false)); // Kondisi belum like
    mockLikeRepository.addLike = vi
      .fn()
      .mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(
      mockCommentRepository.verifyCommentAvailability,
    ).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.checkIsLiked).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    expect(mockLikeRepository.addLike).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
  });

  it('should orchestrating the delete like action correctly when user already liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkIsLiked = vi
      .fn()
      .mockImplementation(() => Promise.resolve(true)); // Kondisi sudah like
    mockLikeRepository.deleteLike = vi
      .fn()
      .mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(
      mockCommentRepository.verifyCommentAvailability,
    ).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.checkIsLiked).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
    expect(mockLikeRepository.deleteLike).toHaveBeenCalledWith(
      useCasePayload.commentId,
      useCasePayload.owner,
    );
  });
});
