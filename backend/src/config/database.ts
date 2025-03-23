import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// MongoDB连接选项
const mongoOptions = {
  // 自动重试连接
  autoReconnect: true,
  // 最大重试次数
  maxAttempts: 5,
};

/**
 * 连接MongoDB数据库
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/twitch-clone';
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB连接成功');
    
    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB连接错误:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB连接断开，尝试重新连接...');
    });
    
  } catch (err) {
    console.error('MongoDB连接失败:', err);
    // 重试，或者终止进程
    process.exit(1);
  }
};

/**
 * 关闭MongoDB连接
 */
export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB连接已关闭');
  } catch (err) {
    console.error('MongoDB关闭失败:', err);
  }
}; 
