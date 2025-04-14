import { startServer } from './app';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常', err);
  process.exit(1);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

// 启动服务器
startServer(); 
