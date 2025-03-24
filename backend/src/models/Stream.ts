import mongoose, { Document, Schema } from 'mongoose';

export interface IStream extends Document {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  category: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  isLive: boolean;
  viewerCount: number;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StreamSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  thumbnailUrl: { 
    type: String
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  isLive: { 
    type: Boolean, 
    default: false 
  },
  viewerCount: { 
    type: Number, 
    default: 0 
  },
  startedAt: { 
    type: Date 
  },
  endedAt: { 
    type: Date 
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret._id = ret._id.toString();
      delete ret.__v;
      return ret;
    }
  }
});

// 创建索引以优化查询性能
StreamSchema.index({ isLive: 1 });
StreamSchema.index({ category: 1 });
StreamSchema.index({ user: 1 });
StreamSchema.index({ viewerCount: -1 });

export default mongoose.model<IStream>('Stream', StreamSchema);

/**
 * Stream模型文档
 * 
 * Stream模型用于存储直播间相关信息，包括：
 * - 直播标题、描述
 * - 缩略图
 * - 所属分类和创建者
 * - 直播状态和观看人数
 * - 直播开始和结束时间
 * 
 * 索引设计：
 * - isLive: 用于快速查询正在直播的内容
 * - category: 用于按分类查询直播
 * - user: 用于查询特定用户的直播
 * - viewerCount: 用于按观看人数排序（热门直播）
 */ 
