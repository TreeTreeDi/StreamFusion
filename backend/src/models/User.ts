import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  username: string;
  email: string;
  password: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  isStreamer: boolean;
  streamKey?: string;
  streamKeyGeneratedAt?: Date;
  isAdmin: boolean;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>({
  username: { 
    type: String, 
    required: [true, '用户名是必填的'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [20, '用户名最多20个字符']
  },
  email: { 
    type: String, 
    required: [true, '邮箱是必填的'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的邮箱地址']
  },
  password: { 
    type: String, 
    required: [true, '密码是必填的'],
    minlength: [6, '密码至少需要6个字符']
  },
  displayName: { 
    type: String,
    default: function(this: any) {
      return this.username;
    }
  },
  avatar: { 
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  bio: { 
    type: String,
    maxlength: [200, '个人简介最多200个字符']
  },
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  isStreamer: { 
    type: Boolean, 
    default: false 
  },
  streamKey: { 
    type: String,
    unique: true,
    sparse: true
  },
  streamKeyGeneratedAt: {
    type: Date,
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 保存前加密密码
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 比较密码方法
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 导出模型
const User = mongoose.model<IUser>('User', UserSchema);
export default User; 
