import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
// Use reliable DNS resolvers (same as server)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jaipur_shop';

(async () => {
  try {
    await mongoose.connect(mongoUri, { family: 4 });
    const collection = mongoose.connection.collection('categories');
    const indexes = await collection.indexes();
    console.log('Existing indexes:', indexes);
    const staleIndexes = ['name_1', 'slug_1'];
    for (const idx of staleIndexes) {
      if (indexes.some(i => i.name === idx)) {
        await collection.dropIndex(idx);
        console.log(`Dropped stale index ${idx}`);
      } else {
        console.log(`Stale index ${idx} not found`);
      }
    }
    // Ensure the correct unique index on title exists
    await collection.createIndex({ title: 1 }, { unique: true, name: 'title_1' });
    console.log('Ensured unique index on title');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error fixing indexes:', err);
    process.exit(1);
  }
})();
