/**
 * Delete all seed-50 test properties (owned by @example.com users)
 * Run with: npx ts-node scripts/cleanup-seed50.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Property from '../src/models/Property.model';
import User from '../src/models/User.model';

const cleanup = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected\n');

    // Find all @example.com test users
    const testUsers = await User.find({ email: /@example\.com$/ }).select('_id email profile.name').lean();
    console.log(`Found ${testUsers.length} test users (@example.com):`);
    testUsers.forEach((u: any) => {
      console.log(`  - ${u.profile?.name || 'N/A'} (${u.email}) [${u._id}]`);
    });

    if (testUsers.length === 0) {
      console.log('No test users found. Exiting.');
      return;
    }

    const testUserIds = testUsers.map((u: any) => u._id);

    // Find properties owned by test users
    const testProperties = await Property.find({ owner: { $in: testUserIds } })
      .select('title address.city propertyType listingType')
      .lean();

    console.log(`\nFound ${testProperties.length} properties owned by test users:\n`);
    testProperties.forEach((p: any, i: number) => {
      console.log(`  ${i + 1}. [${p.propertyType}] ${p.title} (${p.address?.city})`);
    });

    // Also check: any non-Hyderabad properties NOT owned by test users?
    const nonHydProperties = await Property.find({
      'address.city': { $nin: ['Hyderabad', 'Bhongir'] },
      owner: { $nin: testUserIds }
    }).select('title address.city owner').populate('owner', 'email profile.name').lean();

    if (nonHydProperties.length > 0) {
      console.log(`\nWARNING: ${nonHydProperties.length} non-Hyderabad properties owned by REAL users (NOT deleting these):`);
      nonHydProperties.forEach((p: any) => {
        console.log(`  - ${p.title} (${p.address?.city}) by ${p.owner?.email}`);
      });
    }

    // Delete test properties
    if (testProperties.length > 0) {
      const result = await Property.deleteMany({ owner: { $in: testUserIds } });
      console.log(`\nDeleted ${result.deletedCount} test properties`);
    }

    // Delete test users too
    const userResult = await User.deleteMany({ email: /@example\.com$/ });
    console.log(`Deleted ${userResult.deletedCount} test users`);

    // Final count
    const remaining = await Property.countDocuments();
    const remainingUsers = await User.countDocuments();
    console.log(`\nRemaining: ${remaining} properties, ${remainingUsers} users`);

  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Done.');
  }
};

cleanup();
