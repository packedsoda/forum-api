import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const newReply = new NewReply({ content: 'sebuah balasan' });
      const fakeIdGenerator = () => '123';
      const repository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const addedReply = await repository.addReply(
        newReply,
        'comment-123',
        'user-123',
      );

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'sebuah balasan',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('verifyReplyAvailability function', () => {
    it('should throw NotFoundError when reply not available', async () => {
      const repository = new ReplyRepositoryPostgres(pool, {});
      await expect(
        repository.verifyReplyAvailability('reply-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply available', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
      });

      const repository = new ReplyRepositoryPostgres(pool, {});
      await expect(
        repository.verifyReplyAvailability('reply-123'),
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const repository = new ReplyRepositoryPostgres(pool, {});
      await expect(
        repository.verifyReplyOwner('reply-123', 'user-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner is not the real owner', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
      });

      const repository = new ReplyRepositoryPostgres(pool, {});
      await expect(
        repository.verifyReplyOwner('reply-123', 'user-456'),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when owner is the real owner', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        owner: 'user-123',
      });

      const repository = new ReplyRepositoryPostgres(pool, {});
      await expect(
        repository.verifyReplyOwner('reply-123', 'user-123'),
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should update is_delete to true in database', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        isDelete: false,
      });

      const repository = new ReplyRepositoryPostgres(pool, {});
      await repository.deleteReply('reply-123');

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_delete).toEqual(true);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return empty array when thread has no replies', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
      });

      const repository = new ReplyRepositoryPostgres(pool, {});
      const replies = await repository.getRepliesByThreadId('thread-123');

      expect(replies).toEqual([]);
    });

    it('should return replies correctly', async () => {
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
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
        date: '2023-01-01T00:00:00.000Z',
        content: 'sebuah balasan',
        isDelete: false,
      });

      const repository = new ReplyRepositoryPostgres(pool, {});
      const replies = await repository.getRepliesByThreadId('thread-123');

      expect(replies).toBeInstanceOf(Array);
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].comment_id).toEqual('comment-123');
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0].content).toEqual('sebuah balasan');
      expect(replies[0].is_delete).toEqual(false);
      expect(replies[0].date).toBeDefined();
    });
  });
});
