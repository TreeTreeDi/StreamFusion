import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Stream from '../models/Stream';
import Category from '../models/Category';

// 加载环境变量
dotenv.config();

// 连接到MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/twitch-clone';
    console.log(`尝试连接到数据库: ${mongoURI}`);
    await mongoose.connect(mongoURI);
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// 推荐主播数据
const recommendedStreamers = [
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

// 种子数据函数
const seedRecommendedChannels = async () => {
  try {
    console.log('开始创建推荐频道数据...');
    
    // 连接数据库
    await connectDB();

    console.log('检查用户集合是否存在...');
    // 断言连接已建立
    const db = mongoose.connection.db!;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('数据库中的集合:', collectionNames);

    if (!collectionNames.includes('users')) {
      console.error('用户集合不存在，请确保数据库初始化正确');
      process.exit(1);
    }

    // 查询现有用户，如果已存在则不添加
    console.log('查询现有用户...');
    const existingUsers = await User.find({ 
      username: { $in: recommendedStreamers.map(streamer => streamer.username) } 
    });
    console.log(`找到 ${existingUsers.length} 个现有用户`);
    
    const existingUsernames = existingUsers.map(user => user.username);
    
    // 过滤出不存在的用户
    const newStreamers = recommendedStreamers.filter(
      streamer => !existingUsernames.includes(streamer.username)
    );

    if (newStreamers.length > 0) {
      // 添加新的推荐主播
      console.log(`添加 ${newStreamers.length} 个新的推荐主播...`);
      await User.insertMany(newStreamers);
      console.log(`已添加 ${newStreamers.length} 个新的推荐主播`);
    } else {
      console.log('所有推荐主播已存在，无需添加');
    }

    // 获取所有推荐主播
    console.log('获取所有推荐主播...');
    const streamers = await User.find({ 
      username: { $in: recommendedStreamers.map(streamer => streamer.username) } 
    });
    console.log(`找到 ${streamers.length} 个推荐主播`);

    // 获取分类
    console.log('获取分类...');
    const categories = await Category.find({});
    console.log(`找到 ${categories.length} 个分类`);
    
    if (categories.length === 0) {
      console.error('没有找到任何分类，请先运行分类种子脚本');
      process.exit(1);
    }

    // 删除这些主播的现有直播
    console.log('删除现有直播...');
    await Stream.deleteMany({}); // 清除所有直播数据
    console.log('已清除所有直播数据');
    
    // 为每个主播创建测试直播
    console.log('创建新的测试直播...');
    const thumbnails = [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'
    ];

    const streams = streamers.map((streamer, index) => {
      // 随机选择一个分类
      const category = categories[index % categories.length];
      
      return {
        title: `${streamer.displayName || streamer.username}的精彩直播`,
        description: `欢迎来到${streamer.displayName || streamer.username}的直播间，今天我们将进行${category.name}内容的分享`,
        thumbnailUrl: thumbnails[index % thumbnails.length],
        category: category._id,
        user: streamer._id,
        isLive: Math.random() > 0.3, // 70%概率在线
        viewerCount: Math.floor(Math.random() * 10000),
        startedAt: new Date()
      };
    });

    const insertResult = await Stream.insertMany(streams);
    console.log(`已为 ${insertResult.length} 个主播创建测试直播`);

    console.log('推荐频道数据创建完成');
    process.exit(0);
  } catch (error) {
    console.error('推荐频道数据创建失败:', error);
    process.exit(1);
  }
};

// 执行种子数据函数
seedRecommendedChannels(); 
