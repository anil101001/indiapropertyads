/**
 * Delete Script: Remove all existing plot properties
 * 
 * This script deletes all properties with propertyType='plot' from the database.
 * Use this during development phase to start fresh with the new landDetails schema.
 * 
 * Run with: npx ts-node scripts/delete-all-plots.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import Property model
import Property from '../src/models/Property.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/indiapropertyads';

async function deleteAllPlots() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  DELETE: Removing all plot properties');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count existing plots
    const plotCount = await Property.countDocuments({ propertyType: 'plot' });
    console.log(`\n📊 Found ${plotCount} plot(s) in database`);

    if (plotCount === 0) {
      console.log('✅ No plots to delete');
      return;
    }

    // List plots before deletion
    const plots = await Property.find({ propertyType: 'plot' }).select('title _id createdAt');
    console.log('\n📋 Plots to be deleted:');
    plots.forEach((plot, idx) => {
      console.log(`  ${idx + 1}. ${plot.title} (ID: ${plot._id})`);
    });

    // Delete all plots
    console.log('\n🗑️  Deleting plots...');
    const result = await Property.deleteMany({ propertyType: 'plot' });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 DELETE SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  ✅ Deleted: ${result.deletedCount} plot(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error: any) {
    console.error('\n❌ Delete failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the delete script
deleteAllPlots();
