// backend/src/tests/auth.test.ts
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app'; // 修改导入方式
import mongoose from 'mongoose';
import User from '../models/User';

// 可能需要配置测试数据库连接
const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/twitch_clone_test';

// 使用 app 实例创建 Supertest 请求对象
const agent = request.agent(app.callback()); // 使用 .callback() 获取 Koa 回调

let testUser: any;
let authToken: string;

describe('Auth API - Stream Key Management', () => {

  beforeAll(async () => {
    // 连接到测试数据库
    if (mongoose.connection.readyState === 0) { // 防止重复连接
      await mongoose.connect(TEST_DB_URI);
    }
    // 清理测试用户（如果存在）
    await User.deleteMany({ email: 'testuser-stream@example.com' });
    // 创建一个测试用户
    const res = await agent // 使用 agent
      .post('/api/auth/register')
      .send({
        username: 'testuserstream',
        email: 'testuser-stream@example.com',
        password: 'password123'
      });
    
    // 检查注册是否成功
    if (res.status !== 201 || !res.body.success) {
      console.error('测试用户注册失败:', res.body);
      throw new Error('无法创建测试用户');
    }

    testUser = res.body.data.user;
    authToken = res.body.data.token;
  }, 30000); // 增加超时时间

  afterAll(async () => {
    // 清理测试用户
    if (testUser) { // 确保 testUser 已定义
      await User.findByIdAndDelete(testUser.id);
    }
    // 关闭数据库连接
    await mongoose.connection.close();
  });

  // --- 获取推流密钥测试 ---
  describe('GET /api/auth/stream-key', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await agent.get('/api/auth/stream-key'); // 使用 agent
      expect(res.status).toBe(401);
    });

    it('should generate and return a stream key for an authenticated user on first request', async () => {
      const res = await agent // 使用 agent
        .get('/api/auth/stream-key')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('streamKey');
      expect(typeof res.body.data.streamKey).toBe('string');
      expect(res.body.data.streamKey.length).toBeGreaterThan(10); // 检查密钥长度

      // 验证数据库中是否已保存
      const user = await User.findById(testUser.id);
      expect(user?.streamKey).toBe(res.body.data.streamKey);
      expect(user?.streamKeyGeneratedAt).toBeInstanceOf(Date);
    });

    it('should return the existing stream key for subsequent requests', async () => {
      // 先获取一次确保密钥已生成
      const firstRes = await agent // 使用 agent
        .get('/api/auth/stream-key')
        .set('Authorization', `Bearer ${authToken}`);
      const firstKey = firstRes.body.data.streamKey;

      // 再次请求
      const secondRes = await agent // 使用 agent
        .get('/api/auth/stream-key')
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(secondRes.status).toBe(200);
      expect(secondRes.body.success).toBe(true);
      expect(secondRes.body.data.streamKey).toBe(firstKey); // 密钥应与第一次相同
    });
  });

  // --- 重置推流密钥测试 ---
  describe('POST /api/auth/stream-key/regenerate', () => {
    let initialKey: string;

    beforeAll(async () => {
      // 确保用户有一个初始密钥
      const res = await agent // 使用 agent
        .get('/api/auth/stream-key')
        .set('Authorization', `Bearer ${authToken}`);
      initialKey = res.body.data.streamKey;
    });

    it('should return 401 if not authenticated', async () => {
      const res = await agent.post('/api/auth/stream-key/regenerate'); // 使用 agent
      expect(res.status).toBe(401);
    });

    it('should regenerate and return a new stream key for an authenticated user', async () => {
      const res = await agent // 使用 agent
        .post('/api/auth/stream-key/regenerate')
        .set('Authorization', `Bearer ${authToken}`);
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('streamKey');
      expect(typeof res.body.data.streamKey).toBe('string');
      expect(res.body.data.streamKey.length).toBeGreaterThan(10);
      expect(res.body.data.streamKey).not.toBe(initialKey); // 验证密钥已更新

      // 验证数据库中的密钥也已更新
      const user = await User.findById(testUser.id);
      expect(user?.streamKey).toBe(res.body.data.streamKey);
      expect(user?.streamKeyGeneratedAt).toBeInstanceOf(Date);
    });
  });
});
