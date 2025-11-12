const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/india-property-ads';

const deleteInvalidUsers = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find users with names containing numbers
    console.log('🔍 Finding users with invalid names (containing numbers)...\n');
    
    const invalidUsers = await usersCollection.find({
      'profile.name': { $regex: /\d/ } // Match names containing digits
    }).toArray();

    if (invalidUsers.length === 0) {
      console.log('✅ No invalid users found!\n');
      await mongoose.connection.close();
      return;
    }

    console.log(`Found ${invalidUsers.length} user(s) with invalid names:\n`);
    invalidUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Name: ${user.profile?.name}, Created: ${user.createdAt}`);
    });

    console.log('\n🗑️  Deleting invalid users...');
    
    const result = await usersCollection.deleteMany({
      'profile.name': { $regex: /\d/ }
    });

    console.log(`✅ Deleted ${result.deletedCount} user(s)\n`);

    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the cleanup
deleteInvalidUsers();
