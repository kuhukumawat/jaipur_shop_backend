import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

async function fixIndexes() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jaipur_shop', { family: 4 });
  console.log('Connected');

  const db = mongoose.connection.db!;
  const collections = await db.listCollections({ name: 'categories' }).toArray();

  if (collections.length === 0) {
    console.log('No categories collection found — nothing to fix.');
    process.exit(0);
  }

  const indexes = await db.collection('categories').indexes();
  console.log('Current indexes:', indexes.map(i => i.name));

  // Drop any stale index that isn't _id or title_1
  for (const idx of indexes) {
    if (idx.name !== '_id_' && idx.name !== 'title_1') {
      console.log(`Dropping stale index: ${idx.name}`);
      await db.collection('categories').dropIndex(idx.name!);
    }
  }

  console.log('Done! Remaining indexes:', (await db.collection('categories').indexes()).map(i => i.name));
  process.exit(0);
}

fixIndexes().catch(err => { console.error(err); process.exit(1); });
