import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string;
  useCount: number;
  categories?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  description: { 
    type: String,
    trim: true
  },
  useCount: {
    type: Number,
    default: 0
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }]
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
TagSchema.index({ slug: 1 });
TagSchema.index({ useCount: -1 });
TagSchema.index({ 'categories': 1 });

export default mongoose.model<ITag>('Tag', TagSchema);

/**
 * Tag模型文档
 * 
 * Tag模型用于存储标签信息，包括：
 * - 标签名称和唯一标识符(slug)
 * - 标签描述
 * - 使用次数
 * - 关联的分类
 * 
 * 索引设计：
 * - slug: 用于通过slug快速查询标签
 * - useCount: 用于查询热门标签
 * - categories: 用于按分类查询标签
 */ 
