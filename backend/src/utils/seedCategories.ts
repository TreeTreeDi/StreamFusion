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
    coverImage: '/images/categories/games.jpg',
    viewerCount: 35000,
    streamCount: 100
  },
  {
    name: '音乐',
    slug: 'music',
    description: '音乐表演和创作',
    coverImage: '/images/categories/music.jpg',
    viewerCount: 12000,
    streamCount: 50
  },
  {
    name: '聊天',
    slug: 'chat',
    description: '与观众互动聊天',
    coverImage: '/images/categories/chat.jpg',
    viewerCount: 8500,
    streamCount: 30
  },
  {
    name: '户外',
    slug: 'irl',
    description: '户外直播与旅行',
    coverImage: '/images/categories/irl.jpg',
    viewerCount: 5000,
    streamCount: 20
  },
  {
    name: '创意',
    slug: 'creative',
    description: '艺术创作和手工制作',
    coverImage: '/images/categories/creative.jpg',
    viewerCount: 3000,
    streamCount: 15
  },
  {
    name: '电子竞技',
    slug: 'esports',
    description: '电子竞技比赛和赛事',
    coverImage: '/images/categories/esports.jpg',
    viewerCount: 20000,
    streamCount: 40
  }
];

const testStreamers = [
  {
    username: 'gamer123',
    email: 'gamer123@test.com',
    password: 'password123',
    displayName: '职业玩家小王',
    bio: '专业游戏玩家,擅长FPS和MOBA类游戏',
    isStreamer: true,
    isAdmin: false
  },
  {
    username: 'musician99',
    email: 'musician99@test.com', 
    password: 'password123',
    displayName: '音乐人小李',
    bio: '音乐创作者,钢琴演奏家',
    isStreamer: true,
    isAdmin: false
  },
  {
    username: 'traveler55',
    email: 'traveler55@test.com',
    password: 'password123',
    displayName: '旅行家小张',
    bio: '环球旅行者,分享世界各地的风景和文化',
    isStreamer: true,
    isAdmin: false
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
      thumbnailUrl: `/images/streams/thumbnail${index + 1}.jpg`,
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
