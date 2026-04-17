/* eslint-disable camelcase */
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import GetThreadUseCase from '../GetThreadUseCase.js';
import { vi } from 'vitest';

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    const threadId = 'thread-123';

    const mockThread = {
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2023-01-01',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2023-01-02',
        content: 'sebuah komentar',
        is_delete: false,
        like_count: 0,
      },
      {
        id: 'comment-2',
        username: 'janedoe',
        date: '2023-01-03',
        content: 'komentar dihapus',
        is_delete: true,
        like_count: 0,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-1',
        comment_id: 'comment-1',
        content: 'sebuah balasan',
        date: '2023-01-04',
        is_delete: false,
        username: 'dicoding',
      },
      {
        id: 'reply-2',
        comment_id: 'comment-1',
        content: 'balasan dihapus',
        date: '2023-01-05',
        is_delete: true,
        username: 'johndoe',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const thread = await getThreadUseCase.execute({ threadId });

    expect(thread).toStrictEqual({
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2023-01-01',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2023-01-02',
          content: 'sebuah komentar',
          likeCount: 0,
          replies: [
            {
              id: 'reply-1',
              username: 'dicoding',
              date: '2023-01-04',
              content: 'sebuah balasan',
            },
            {
              id: 'reply-2',
              username: 'johndoe',
              date: '2023-01-05',
              content: '**balasan telah dihapus**',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'janedoe',
          date: '2023-01-03',
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [],
        },
      ],
    });

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      threadId,
    );
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith(
      threadId,
    );
  });
});
