/**
 * Clean up test data for fresh start
 * Run with: npx ts-node scripts/clean-test-data.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
import Property from '../src/models/Property.model';
import User from '../src/models/User.model';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const cleanDatabase = async () => {
  try {
    console.log('🗑️  DATABASE CLEANUP UTILITY\n');
    console.log('⚠️  WARNING: This will permanently delete data!\n');

    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB\n');

    // Show current stats
    const propertyCount = await Property.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('📊 Current Database Stats:');
    console.log(`   Properties: ${propertyCount}`);
    console.log(`   Users: ${userCount}\n`);

    // Ask for confirmation
    const confirmCleanup = await askQuestion('Do you want to proceed with cleanup? (yes/no): ');
    
    if (confirmCleanup.toLowerCase() !== 'yes') {
      console.log('\n❌ Cleanup cancelled.');
      process.exit(0);
    }

    console.log('\n🧹 Starting cleanup...\n');

    // 1. Clean Properties
    const cleanProperties = await askQuestion('Delete all properties? (yes/no): ');
    if (cleanProperties.toLowerCase() === 'yes') {
      console.log('🗑️  Deleting all properties...');
      const result = await Property.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} properties\n`);
    }

    // 2. Clean Conversations
    const cleanConversations = await askQuestion('Delete all AI chat conversations? (yes/no): ');
    if (cleanConversations.toLowerCase() === 'yes') {
      console.log('🗑️  Deleting all conversations...');
      const db = mongoose.connection.db!;
      const conversationsCollection = db.collection('conversations');
      const result = await conversationsCollection.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} conversations\n`);
    }

    // 3. Clean Users (optional - be careful!)
    const cleanUsers = await askQuestion('Delete all users? (DANGEROUS - yes/no): ');
    if (cleanUsers.toLowerCase() === 'yes') {
      const doubleConfirm = await askQuestion('⚠️  Are you ABSOLUTELY sure? This will delete all user accounts! (yes/no): ');
      if (doubleConfirm.toLowerCase() === 'yes') {
        console.log('🗑️  Deleting all users...');
        const result = await User.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} users\n`);
      }
    }

    // 4. Reset MongoDB Atlas Vector Search Index (info only)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 IMPORTANT: Vector Search Index');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('The MongoDB Atlas vector search index is still active.');
    console.log('It will automatically rebuild when you add new properties.');
    console.log('No manual action needed!\n');

    console.log('✨ Cleanup complete!\n');

    // Show final stats
    const finalPropertyCount = await Property.countDocuments();
    const finalUserCount = await User.countDocuments();
    
    console.log('📊 Final Database Stats:');
    console.log(`   Properties: ${finalPropertyCount}`);
    console.log(`   Users: ${finalUserCount}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Next Steps:');
    console.log('1. Add fresh test properties via the UI or API');
    console.log('2. Run vectorization: npx ts-node scripts/vectorize-properties.ts');
    console.log('3. Test AI chat with clean data');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('\n❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
};

// Run cleanup
cleanDatabase();
