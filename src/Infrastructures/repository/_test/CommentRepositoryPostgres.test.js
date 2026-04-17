import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      const newComment = new NewComment({ content: 'sebuah komentar' });
      const fakeIdGenerator = () => '123'; // mock nanoid
      const repository = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await repository.addComment(
        newComment,
        'thread-123',
        'user-123',
      );

      const comments =
        await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'sebuah komentar',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('checkAvailabilityComment function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      const repository = new CommentRepositoryPostgres(pool, {});
      await expect(
        repository.checkAvailabilityComment('comment-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment available', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      const repository = new CommentRepositoryPostgres(pool, {});
      await expect(
        repository.checkAvailabilityComment('comment-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const repository = new CommentRepositoryPostgres(pool, {});
      await expect(
        repository.verifyCommentOwner('comment-123', 'user-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner is not the real owner', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
      });

      const repository = new CommentRepositoryPostgres(pool, {});
      await expect(
        repository.verifyCommentOwner('comment-123', 'user-456'),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when owner is the real owner', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
      });

      const repository = new CommentRepositoryPostgres(pool, {});
      await expect(
        repository.verifyCommentOwner('comment-123', 'user-123'),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should update is_delete to true in database', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        isDelete: false,
      });

      const repository = new CommentRepositoryPostgres(pool, {});
      await repository.deleteComment('comment-123');

      const comments =
        await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toEqual(true);
    });
  });
  describe('getCommentsByThreadId function', () => {
    it('should return empty array when thread has no comments', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      const repository = new CommentRepositoryPostgres(pool, {});
      const comments = await repository.getCommentsByThreadId('thread-123');
      expect(comments).toEqual([]);
    });

    it('should return comments correctly', async () => {
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        date: '2023-01-01T00:00:00.000Z',
        content: 'sebuah komentar',
        isDelete: false,
      });

      const repository = new CommentRepositoryPostgres(pool, {});
      const comments = await repository.getCommentsByThreadId('thread-123');

      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].content).toEqual('sebuah komentar');
      expect(comments[0].is_delete).toEqual(false);
      expect(comments[0].date).toBeDefined();
      expect(comments[0].like_count).toEqual(0);
    });
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      const repository = new CommentRepositoryPostgres(pool, {});
      await expect(
        repository.verifyCommentAvailability('comment-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment available', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });

      const repository = new CommentRepositoryPostgres(pool, {});
      await expect(
        repository.verifyCommentAvailability('comment-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
