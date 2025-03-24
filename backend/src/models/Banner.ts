import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  isExternal: boolean;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  targetUrl: {
    type: String,
    required: true,
  },
  isExternal: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
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

// 创建索引，便于按优先级排序
BannerSchema.index({ priority: -1 });
BannerSchema.index({ isActive: 1 });

export default mongoose.model<IBanner>('Banner', BannerSchema); 
