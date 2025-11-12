const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/india-property-ads';

const deleteAzentiqUsers = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find users with email contact@azentiq.ai
    console.log('🔍 Finding users with email: contact@azentiq.ai...\n');
    
    const targetUsers = await usersCollection.find({
      email: 'contact@azentiq.ai'
    }).toArray();

    if (targetUsers.length === 0) {
      console.log('✅ No users found with email contact@azentiq.ai\n');
      await mongoose.connection.close();
      return;
    }

    console.log(`Found ${targetUsers.length} user(s) with email contact@azentiq.ai:\n`);
    targetUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Name: ${user.profile?.name}, Created: ${user.createdAt}`);
    });

    console.log('\n🗑️  Deleting users...');
    
    const result = await usersCollection.deleteMany({
      email: 'contact@azentiq.ai'
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
deleteAzentiqUsers();
