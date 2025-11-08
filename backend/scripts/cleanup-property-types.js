/**
 * Cleanup Script: Remove invalid property types (residential/commercial)
 * Run this script to clean up test data with invalid property types
 * 
 * Usage: node scripts/cleanup-property-types.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/india-property-ads';

const cleanupPropertyTypes = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const propertiesCollection = db.collection('properties');

    // Step 1: Check for invalid property types
    console.log('🔍 Checking for invalid property types...');
    const invalidProperties = await propertiesCollection.find({
      propertyType: { $nin: ['apartment', 'villa', 'independent-house', 'plot'] }
    }).toArray();

    console.log(`Found ${invalidProperties.length} properties with invalid types\n`);

    if (invalidProperties.length === 0) {
      console.log('✅ No cleanup needed. All property types are valid.');
      await mongoose.connection.close();
      return;
    }

    // Display invalid properties
    console.log('📋 Invalid Properties:');
    invalidProperties.forEach((prop, index) => {
      console.log(`  ${index + 1}. ID: ${prop._id}`);
      console.log(`     Title: ${prop.title}`);
      console.log(`     Current Type: ${prop.propertyType}`);
      console.log(`     Owner: ${prop.owner}`);
      console.log('');
    });

    // Step 2: Strategy - Map invalid types to valid types
    console.log('🔧 Cleanup Strategy:');
    console.log('  - "residential" → will be DELETED (ambiguous)');
    console.log('  - "commercial" → will be DELETED (not supported yet)');
    console.log('  - Any other invalid → will be DELETED\n');

    // Step 3: Delete invalid properties
    console.log('🗑️  Deleting invalid properties...');
    const deleteResult = await propertiesCollection.deleteMany({
      propertyType: { $nin: ['apartment', 'villa', 'independent-house', 'plot'] }
    });

    console.log(`✅ Deleted ${deleteResult.deletedCount} invalid properties\n`);

    // Step 4: Verify cleanup
    console.log('✓ Verifying cleanup...');
    const remainingInvalid = await propertiesCollection.countDocuments({
      propertyType: { $nin: ['apartment', 'villa', 'independent-house', 'plot'] }
    });

    if (remainingInvalid === 0) {
      console.log('✅ All invalid property types have been cleaned up!');
    } else {
      console.log(`⚠️  Warning: ${remainingInvalid} invalid properties still remain`);
    }

    // Step 5: Show summary
    console.log('\n📊 Database Summary:');
    const apartments = await propertiesCollection.countDocuments({ propertyType: 'apartment' });
    const villas = await propertiesCollection.countDocuments({ propertyType: 'villa' });
    const houses = await propertiesCollection.countDocuments({ propertyType: 'independent-house' });
    const plots = await propertiesCollection.countDocuments({ propertyType: 'plot' });
    const total = apartments + villas + houses + plots;

    console.log(`  Apartments: ${apartments}`);
    console.log(`  Villas: ${villas}`);
    console.log(`  Independent Houses: ${houses}`);
    console.log(`  Plots: ${plots}`);
    console.log(`  Total Valid Properties: ${total}\n`);

    console.log('✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the cleanup
cleanupPropertyTypes();
