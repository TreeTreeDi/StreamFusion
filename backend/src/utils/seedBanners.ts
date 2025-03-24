import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Banner from '../models/Banner';

// 加载环境变量
dotenv.config();

// 连接到MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/twitch-clone';
    await mongoose.connect(mongoURI);
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 轮播图数据
const bannerData = [
  {
    title: 'LOL全球总决赛直播',
    description: '观看全球顶尖战队的激烈对决，体验电竞的最高殿堂！',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2940&auto=format&fit=crop',
    targetUrl: '/category/games',
    isExternal: false,
    priority: 1,
    isActive: true,
  },
  {
    title: '年度音乐颁奖典礼',
    description: '全球音乐盛典，直击现场，不容错过！',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2940&auto=format&fit=crop',
    targetUrl: '/category/music',
    isExternal: false,
    priority: 2,
    isActive: true,
  },
  {
    title: '户外探险系列',
    description: '走进大自然，体验不一样的户外直播冒险',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2940&auto=format&fit=crop',
    targetUrl: '/category/irl',
    isExternal: false,
    priority: 3,
    isActive: true,
  },
  {
    title: '加入我们的创作者计划',
    description: '成为认证直播创作者，获得专属支持和收益分成',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2940&auto=format&fit=crop',
    targetUrl: '/creator-program',
    isExternal: false,
    priority: 4,
    isActive: true,
  },
  {
    title: '了解最新的直播平台功能',
    description: '探索我们最新发布的平台功能和工具',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2940&auto=format&fit=crop',
    targetUrl: '/blog/updates',
    isExternal: false,
    priority: 5,
    isActive: true,
  },
];

// 种子数据函数
const seedBanners = async () => {
  try {
    // 连接数据库
    await connectDB();

    // 清空现有数据
    await Banner.deleteMany({});
    console.log('已清空现有轮播图数据');

    // 添加新数据
    await Banner.insertMany(bannerData);
    console.log('轮播图数据添加成功');

    // 完成
    console.log('轮播图种子数据创建完成');
    process.exit(0);
  } catch (error) {
    console.error('轮播图种子数据创建失败:', error);
    process.exit(1);
  }
};

// 执行种子数据函数
seedBanners(); 
