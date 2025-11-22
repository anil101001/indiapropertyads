import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
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

// Clean duplicate properties (keep the newest one)
const cleanDuplicates = async () => {
  try {
    await connectDB();

    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    console.log('🔍 Finding duplicates...\n');

    // Find duplicates
    const duplicates = await mongoose.connection.db.collection('properties').aggregate([
      {
        $group: {
          _id: {
            title: '$title',
            city: '$address.city',
            fullAddress: '$address.fullAddress',
            owner: '$owner'
          },
          docs: { 
            $push: { 
              id: '$_id', 
              createdAt: '$createdAt' 
            } 
          },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]).toArray();

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      process.exit(0);
    }

    let deletedCount = 0;
    const idsToDelete: any[] = [];

    for (const dup of duplicates) {
      // Sort by createdAt (newest first)
      const sorted = dup.docs.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Keep the first (newest), delete the rest
      const toDelete = sorted.slice(1);
      idsToDelete.push(...toDelete.map((d: any) => d.id));
      
      console.log(`📋 "${dup._id.title}"`);
      console.log(`   Keeping: ${sorted[0].id} (created: ${sorted[0].createdAt})`);
      console.log(`   Deleting: ${toDelete.length} duplicates`);
      console.log('');
      
      deletedCount += toDelete.length;
    }

    // Delete the duplicates
    if (idsToDelete.length > 0) {
      console.log(`\n🗑️  Deleting ${idsToDelete.length} duplicate properties...\n`);
      
      const result = await mongoose.connection.db.collection('properties').deleteMany({
        _id: { $in: idsToDelete }
      });
      
      console.log(`✅ Deleted ${result.deletedCount} duplicate properties!`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanDuplicates();
