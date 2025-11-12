/**
 * Automated cleanup - no prompts, just clean properties and conversations
 * Run with: npx ts-node scripts/auto-cleanup.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Property from '../src/models/Property.model';

const autoCleanup = async () => {
  try {
    console.log('🗑️  AUTOMATED CLEANUP\n');

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected\n');

    // Show current stats
    const propertyCount = await Property.countDocuments();
    console.log(`📊 Found ${propertyCount} properties\n`);

    // Delete all properties
    console.log('🗑️  Deleting all properties...');
    const result = await Property.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} properties\n`);

    // Clean conversations
    console.log('🗑️  Deleting all conversations...');
    const db = mongoose.connection.db!;
    const conversationsCollection = db.collection('conversations');
    const convResult = await conversationsCollection.deleteMany({});
    console.log(`✅ Deleted ${convResult.deletedCount} conversations\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Cleanup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Final Stats:');
    const finalCount = await Property.countDocuments();
    console.log(`   Properties: ${finalCount}`);
    console.log(`   Ready for fresh data!\n`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected\n');
  }
};

autoCleanup();
