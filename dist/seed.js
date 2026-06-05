"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("./src/models/User"));
const Category_1 = __importDefault(require("./src/models/Category"));
const connectDB = async () => {
    await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jaipur_shop', { family: 4 });
    console.log('MongoDB Connected');
};
const seed = async () => {
    await connectDB();
    // Create admin user
    const existing = await User_1.default.findOne({ email: 'admin@jaipurshop.com' });
    if (!existing) {
        await User_1.default.create({
            name: 'Admin',
            email: 'admin@jaipurshop.com',
            password: 'admin123',
            role: 'admin',
        });
        console.log('✅ Admin created: admin@jaipurshop.com / admin123');
    }
    else {
        console.log('ℹ️  Admin already exists');
    }
    // Create sample categories
    const cats = ['Fabric', 'Clothing', 'Accessories', 'Home Decor'];
    for (const name of cats) {
        const exists = await Category_1.default.findOne({ name });
        if (!exists) {
            await Category_1.default.create({ name });
            console.log(`✅ Category created: ${name}`);
        }
    }
    console.log('\n🎉 Seed complete!');
    process.exit(0);
};
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
