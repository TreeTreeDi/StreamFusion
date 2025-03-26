import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category';
import User from '../models/User';
import Stream from '../models/Stream';

// 加载环境变量
dotenv.config();

const categories = [
  {
    name: '游戏',
    slug: 'games',
    description: '各种游戏直播',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    viewerCount: 35000,
    streamCount: 100
  },
  {
    name: '音乐',
    slug: 'music',
    description: '音乐表演和创作',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    viewerCount: 12000,
    streamCount: 50
  },
  {
    name: '聊天',
    slug: 'chat',
    description: '与观众互动聊天',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    viewerCount: 8500,
    streamCount: 30
  },
  {
    name: '户外',
    slug: 'irl',
    description: '户外直播与旅行',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    viewerCount: 5000,
    streamCount: 20
  },
  {
    name: '创意',
    slug: 'creative',
    description: '艺术创作和手工制作',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    viewerCount: 3000,
    streamCount: 15
  },
  {
    name: '电子竞技',
    slug: 'esports',
    description: '电子竞技比赛和赛事',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    viewerCount: 20000,
    streamCount: 40
  }
];

const testStreamers = [
  {
    username: 'popular_gamer',
    email: 'popular_gamer@test.com',
    password: 'password123',
    displayName: '人气游戏主播',
    avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop',
    bio: '专业游戏玩家，擅长FPS和MOBA类游戏',
    isStreamer: true
  },
  {
    username: 'music_star',
    email: 'music_star@test.com',
    password: 'password123',
    displayName: '音乐才子',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    bio: '音乐创作者，钢琴演奏家，每晚八点直播',
    isStreamer: true
  },
  {
    username: 'travel_vlogger',
    email: 'travel_vlogger@test.com',
    password: 'password123',
    displayName: '环球旅行家',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
    bio: '探索世界各地的美景和文化，分享旅行见闻',
    isStreamer: true
  },
  {
    username: 'cooking_master',
    email: 'cooking_master@test.com',
    password: 'password123',
    displayName: '烹饪大师',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: '专业厨师，教你制作美食，每周四直播',
    isStreamer: true
  },
  {
    username: 'tech_guru',
    email: 'tech_guru@test.com',
    password: 'password123',
    displayName: '科技达人',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
    bio: '科技产品评测，编程教学，科技新闻讨论',
    isStreamer: true
  }
];


const seedCategories = async () => {
  try {
    // 连接数据库
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/twitch-clone';
    await mongoose.connect(mongoURI);
    console.log('MongoDB连接成功');

    // 清空现有数据
    await Category.deleteMany({});
    await User.deleteMany({});
    await Stream.deleteMany({});
    console.log('已清空现有数据');

    // 创建分类
    const savedCategories = await Category.insertMany(categories);
    console.log('分类数据初始化成功');

    // 创建测试主播账号
    const savedStreamers = await User.insertMany(testStreamers);
    console.log('测试主播账号创建成功');

    // 创建测试直播间
    const testStreams = savedStreamers.map((streamer, index) => ({
      title: `${streamer.displayName}的直播间`,
      description: `欢迎来到${streamer.displayName}的直播间`,
      thumbnailUrl: `https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop`,
      category: savedCategories[index]._id,
      user: streamer._id,
      isLive: true,
      viewerCount: Math.floor(Math.random() * 1000) + 100
    }));

    await Stream.insertMany(testStreams);
    console.log('测试直播间创建成功');

    process.exit(0);
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  }
};

// 执行脚本
seedCategories();
