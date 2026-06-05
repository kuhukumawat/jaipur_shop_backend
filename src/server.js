require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
    console.log(`🏪 Shop: ${process.env.SHOP_NAME || 'Jaipur Shop'}\n`);
  });
};

startServer();
