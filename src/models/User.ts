import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false, minlength: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || '');
};

const User = mongoose.model<IUserDocument>('User', userSchema);
export default User;
