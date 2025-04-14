import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import cors from 'koa-cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';

// 导入路由
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import channelRoutes from './routes/channel.routes';
import bannerRoutes from './routes/banner.routes';
import streamRoutes from './routes/stream.routes';
import tagRoutes from './routes/tag.routes';
import srsRoutes from './routes/srs.routes';
import livekitRoutes from './routes/livekit.routes';

// 加载环境变量
dotenv.config();

// 初始化Koa应用
const app = new Koa();
const router = new Router();
// 创建HTTP服务器实例，用于同时支持HTTP和WebSocket
const server = http.createServer(app.callback());

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

// 注册API路由
app.use(authRoutes.routes()).use(authRoutes.allowedMethods({ throw: true }));
app.use(categoryRoutes.routes()).use(categoryRoutes.allowedMethods({ throw: true }));
app.use(channelRoutes.routes()).use(channelRoutes.allowedMethods({ throw: true }));
app.use(bannerRoutes.routes()).use(bannerRoutes.allowedMethods({ throw: true }));
app.use(streamRoutes.routes()).use(streamRoutes.allowedMethods({ throw: true }));
app.use(tagRoutes.routes()).use(tagRoutes.allowedMethods({ throw: true }));
app.use(srsRoutes.routes()).use(srsRoutes.allowedMethods({ throw: true }));
app.use(livekitRoutes.routes()).use(livekitRoutes.allowedMethods({ throw: true }));

// 使用路由
app.use(router.routes()).use(router.allowedMethods({ throw: true }));

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
    const mongoURI = process.env.MONGO_URI || '';
    
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
  
  // 使用HTTP服务器而不是Koa应用直接监听
  server.listen(PORT, () => {
    console.log(`服务器已启动，监听端口: ${PORT}`);
  });
};

// 导出app和server用于测试
export { app, server, startServer };

// 直接执行
if (require.main === module) {
  startServer();
} 
