import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Find duplicate properties
const findDuplicates = async () => {
  try {
    await connectDB();

    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Aggregate to find duplicates based on title, address, and owner
    const duplicates = await mongoose.connection.db.collection('properties').aggregate([
      {
        $group: {
          _id: {
            title: '$title',
            city: '$address.city',
            fullAddress: '$address.fullAddress',
            owner: '$owner'
          },
          uniqueIds: { $addToSet: '$_id' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      process.exit(0);
    }

    console.log(`\n🔍 Found ${duplicates.length} sets of duplicate properties:\n`);
    
    let totalDuplicates = 0;
    for (const dup of duplicates) {
      totalDuplicates += dup.count - 1; // -1 because we keep one original
      console.log(`📋 Property: "${dup._id.title}"`);
      console.log(`   Location: ${dup._id.city}`);
      console.log(`   Duplicates: ${dup.count} copies`);
      console.log(`   IDs: ${dup.uniqueIds.map((id: any) => id.toString()).join(', ')}`);
      console.log('');
    }

    console.log(`\n📊 Total duplicate entries to clean: ${totalDuplicates}\n`);
    
    // Ask if user wants to delete duplicates
    console.log('To delete duplicates (keeping the newest of each), run:');
    console.log('npm run clean-duplicates\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

findDuplicates();
