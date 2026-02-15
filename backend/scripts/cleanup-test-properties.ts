/**
 * Cleanup test/seeded properties from the database
 * Run with: npx ts-node scripts/cleanup-test-properties.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Property from '../src/models/Property.model';
import '../src/models/User.model';

const cleanup = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB\n');

    // First, list all properties
    const allProperties = await Property.find()
      .select('title address.city status owner createdAt pricing.expectedPrice images')
      .populate('owner', 'email profile.name')
      .sort({ createdAt: 1 })
      .lean();

    console.log(`📊 Total properties in database: ${allProperties.length}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    allProperties.forEach((p: any, i: number) => {
      const ownerEmail = p.owner?.email || 'unknown';
      const ownerName = p.owner?.profile?.name || 'unknown';
      const hasUnsplashImages = p.images?.some((img: any) => img.url?.includes('unsplash'));
      const isTestOwner = ownerEmail === 'test@example.com';
      const testFlag = (hasUnsplashImages || isTestOwner) ? ' ⚠️ TEST' : '';
      
      console.log(`${i + 1}. [${p.status}] ${p.title}`);
      console.log(`   City: ${p.address?.city || 'N/A'} | Owner: ${ownerName} (${ownerEmail})${testFlag}`);
      console.log(`   ID: ${p._id} | Created: ${new Date(p.createdAt).toLocaleDateString()}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Identify test properties: owned by test@example.com OR with unsplash images
    const testProperties = allProperties.filter((p: any) => {
      const ownerEmail = p.owner?.email || '';
      const hasUnsplashImages = p.images?.some((img: any) => img.url?.includes('unsplash'));
      return ownerEmail === 'test@example.com' || hasUnsplashImages;
    });

    console.log(`🧹 Found ${testProperties.length} test properties to delete:\n`);
    testProperties.forEach((p: any, i: number) => {
      console.log(`   ${i + 1}. ${p.title} (${p.address?.city})`);
    });

    if (testProperties.length === 0) {
      console.log('   No test properties found. Database is clean! ✨');
    } else {
      // Delete test properties
      const testIds = testProperties.map((p: any) => p._id);
      const result = await Property.deleteMany({ _id: { $in: testIds } });
      console.log(`\n🗑️  Deleted ${result.deletedCount} test properties`);

      // Check remaining
      const remaining = await Property.countDocuments();
      console.log(`📊 Remaining properties: ${remaining}`);
    }

    console.log('\n✅ Cleanup complete!\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

cleanup();
