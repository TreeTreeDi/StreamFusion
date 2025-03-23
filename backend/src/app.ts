import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import cors from 'koa-cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 初始化Koa应用
const app = new Koa();
const router = new Router();

// 中间件
app.use(cors());
app.use(bodyParser());
app.use(logger());

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    ctx.status = status;
    ctx.body = {
      success: false,
      status,
      message,
    };
    
    console.error(`[Error] ${status} - ${message}`);
    console.error(err.stack);
    
    ctx.app.emit('error', err, ctx);
  }
});

// 基础路由
router.get('/', (ctx) => {
  ctx.body = {
    success: true,
    message: 'TwitchClone API服务运行正常',
    version: '1.0.0',
  };
});

// 使用路由
app.use(router.routes()).use(router.allowedMethods());

// 未找到路由处理
app.use((ctx) => {
  ctx.status = 404;
  ctx.body = {
    success: false,
    status: 404,
    message: '接口不存在',
  };
});

// 应用错误事件监听
app.on('error', (err, ctx) => {
  console.error('服务器错误', err);
});

// 连接数据库
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/twitch-clone';
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB连接成功');
  } catch (err) {
    console.error('MongoDB连接失败:', err);
    process.exit(1);
  }
};

// 启动服务器
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`服务器已启动，监听端口: ${PORT}`);
  });
};

// 导出app用于测试
export { app, startServer };

// 直接执行
if (require.main === module) {
  startServer();
} 
