// Script to fix the fssaiNumber unique index issue
const mongoose = require('mongoose');
require('dotenv').config();

async function fixFssaiIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Get the sellers collection
    const db = mongoose.connection.db;
    const sellersCollection = db.collection('sellers');

    // List all indexes
    const indexes = await sellersCollection.indexes();
    console.log('Current indexes:', indexes);

    // Check if fssaiNumber unique index exists
    const fssaiIndex = indexes.find(index => 
      index.key && index.key.fssaiNumber === 1 && index.unique === true
    );

    if (fssaiIndex) {
      console.log('Found fssaiNumber unique index, dropping it...');
      await sellersCollection.dropIndex('fssaiNumber_1');
      console.log('Successfully dropped fssaiNumber unique index');
    } else {
      console.log('No fssaiNumber unique index found');
    }

    // List indexes again to confirm
    const updatedIndexes = await sellersCollection.indexes();
    console.log('Updated indexes:', updatedIndexes);

    console.log('Index fix completed successfully');
  } catch (error) {
    console.error('Error fixing fssaiNumber index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixFssaiIndex(); 