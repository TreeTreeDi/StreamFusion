import { app } from './app';
import { connectDB } from './config/database';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 定义端口
const PORT = process.env.PORT || 5000;

// 启动服务器
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();
    
    // 启动服务
    app.listen(PORT, () => {
      console.log(`服务器已启动，监听端口: ${PORT}`);
      console.log(`运行环境: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

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
