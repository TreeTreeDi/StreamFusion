import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string; 
  viewerCount: number;
  streamCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema({
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
  coverImage: {
    type: String
  },
  viewerCount: {
    type: Number,
    default: 0
  },
  streamCount: {
    type: Number,
    default: 0
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
// CategorySchema.index({ slug: 1 });
CategorySchema.index({ viewerCount: -1 });
CategorySchema.index({ streamCount: -1 });

export default mongoose.model<ICategory>('Category', CategorySchema); 
