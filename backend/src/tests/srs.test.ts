import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app'; // 导入 Koa app 实例
import mongoose from 'mongoose';
import User from '../models/User';
import Stream from '../models/Stream';
import { generateStreamKey } from '../lib/utils'; // 假设有这个工具函数

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/twitch_clone_test';
const agent = request.agent(app.callback());

let testUser: any;
let streamKey: string;

describe('SRS Webhook API', () => {

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_DB_URI);
    }
  });

  beforeEach(async () => {
    // 清理可能存在的旧数据
    await User.deleteMany({ email: 'srs-test@example.com' });
    await Stream.deleteMany({});

    // 创建一个测试用户并设置为 streamer
    streamKey = generateStreamKey();
    testUser = new User({
      username: 'srstestuser',
      email: 'srs-test@example.com',
      password: 'password123',
      isStreamer: true,
      streamKey: streamKey,
    });
    await testUser.save();
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'srs-test@example.com' });
    await Stream.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/srs/hooks - on_publish', () => {
    it('should return 200 and create/update stream record if user and key are valid', async () => {
      const payload = {
        action: 'on_publish',
        client_id: 'client123',
        ip: '127.0.0.1',
        vhost: '__defaultVhost__',
        app: 'live',
        stream: streamKey, // 使用测试用户的有效密钥
      };

      const res = await agent.post('/api/srs/hooks').send(payload);

      expect(res.status).toBe(200);
      expect(res.text).toBe('0');

      // 验证数据库中 Stream 记录的状态
      const stream = await Stream.findOne({ user: testUser._id });
      expect(stream).not.toBeNull();
      expect(stream?.isLive).toBe(true);
      expect(stream?.startedAt).toBeInstanceOf(Date);
      expect(stream?.endedAt).toBeUndefined();
    });

    it('should return 404 if stream key is invalid', async () => {
      const payload = {
        action: 'on_publish',
        client_id: 'client123',
        ip: '127.0.0.1',
        vhost: '__defaultVhost__',
        app: 'live',
        stream: 'invalid-stream-key',
      };

      const res = await agent.post('/api/srs/hooks').send(payload);

      expect(res.status).toBe(404);
    });

    it('should return 403 if user is not a streamer', async () => {
      // 更新用户为非主播
      await User.findByIdAndUpdate(testUser._id, { isStreamer: false });

      const payload = {
        action: 'on_publish',
        client_id: 'client123',
        ip: '127.0.0.1',
        vhost: '__defaultVhost__',
        app: 'live',
        stream: streamKey,
      };

      const res = await agent.post('/api/srs/hooks').send(payload);

      expect(res.status).toBe(403);
    });

    it('should return 400 if action or stream key is missing', async () => {
      const payload = { action: 'on_publish' }; // 缺少 stream
      const res = await agent.post('/api/srs/hooks').send(payload);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/srs/hooks - on_unpublish', () => {
    beforeEach(async () => {
      // 确保有一个正在直播的记录
      await Stream.create({
        user: testUser._id,
        title: 'Test Live Stream',
        category: new mongoose.Types.ObjectId("609d5f1f9c9d6b001f7b0e3e"), // 临时 ID
        isLive: true,
        startedAt: new Date(),
      });
    });

    it('should return 200 and update stream record to not live', async () => {
      const payload = {
        action: 'on_unpublish',
        client_id: 'client123',
        ip: '127.0.0.1',
        vhost: '__defaultVhost__',
        app: 'live',
        stream: streamKey,
      };

      const res = await agent.post('/api/srs/hooks').send(payload);

      expect(res.status).toBe(200);
      expect(res.text).toBe('0');

      // 验证数据库中 Stream 记录的状态
      const stream = await Stream.findOne({ user: testUser._id });
      expect(stream).not.toBeNull();
      expect(stream?.isLive).toBe(false);
      expect(stream?.endedAt).toBeInstanceOf(Date);
    });

    it('should return 404 if stream key is invalid', async () => {
      const payload = {
        action: 'on_unpublish',
        client_id: 'client123',
        ip: '127.0.0.1',
        vhost: '__defaultVhost__',
        app: 'live',
        stream: 'invalid-stream-key',
      };

      const res = await agent.post('/api/srs/hooks').send(payload);
      expect(res.status).toBe(404);
    });
     it('should return 403 if user is not a streamer', async () => {
      // 更新用户为非主播
      await User.findByIdAndUpdate(testUser._id, { isStreamer: false });

      const payload = {
        action: 'on_unpublish',
        client_id: 'client123',
        ip: '127.0.0.1',
        vhost: '__defaultVhost__',
        app: 'live',
        stream: streamKey,
      };

      const res = await agent.post('/api/srs/hooks').send(payload);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/srs/hooks - other actions', () => {
    it('should return 200 for unhandled actions', async () => {
      const payload = {
        action: 'on_connect', // 未处理的 action
        client_id: 'client123',
        ip: '127.0.0.1',
        vhost: '__defaultVhost__',
        app: 'live',
        stream: streamKey,
      };

      const res = await agent.post('/api/srs/hooks').send(payload);

      expect(res.status).toBe(200);
      expect(res.text).toBe('0');
    });
  });
}); 
