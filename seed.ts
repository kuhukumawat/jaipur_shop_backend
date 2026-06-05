import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import User from './src/models/User';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jaipur_shop', { family: 4 });
  console.log('MongoDB Connected');
};

const seed = async () => {
  await connectDB();

  // Create admin user
  const existing = await User.findOne({ email: 'admin@jaipurshop.com' });
  if (!existing) {
    await User.create({
      name: 'Admin',
      email: 'admin@jaipurshop.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('  Admin created: admin@jaipurshop.com / admin123');
  } else {
    console.log('   Admin already exists');
  }

  console.log('\n🎉 Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
