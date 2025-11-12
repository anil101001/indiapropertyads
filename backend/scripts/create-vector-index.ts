/**
 * Script to create MongoDB Atlas Vector Search Index
 * Run with: npx ts-node scripts/create-vector-index.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const createVectorIndex = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = mongoose.connection.db!;
    const collection = db.collection('properties');

    console.log('📊 Creating vector search index...');
    console.log('   Index Name: property_vector_index');
    console.log('   Collection: properties');
    console.log('   Field: embedding');
    console.log('   Dimensions: 1536 (OpenAI text-embedding-3-small)');
    console.log('   Similarity: cosine\n');

    // Create the search index using MongoDB's createSearchIndex command
    const indexDefinition = {
      name: 'property_vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            path: 'embedding',
            numDimensions: 1536,
            similarity: 'cosine'
          }
        ]
      }
    };

    try {
      // Note: This requires MongoDB 7.0+ Atlas cluster
      await collection.createSearchIndex(indexDefinition);
      
      console.log('✅ Vector search index created successfully!\n');
      console.log('⏳ Index is building in the background...');
      console.log('   It may take 1-3 minutes to become active.');
      console.log('   You can check status in MongoDB Atlas UI.\n');
      
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️  Index already exists!');
        console.log('   Checking index status...\n');
        
        // List existing indexes
        const indexes: any[] = await collection.listSearchIndexes().toArray();
        const vectorIndex: any = indexes.find((idx: any) => idx.name === 'property_vector_index');
        
        if (vectorIndex) {
          console.log(`   Status: ${vectorIndex.status || 'ACTIVE'}`);
          console.log(`   Type: ${vectorIndex.type || 'vectorSearch'}`);
          console.log('   ✅ Vector search is ready to use!\n');
        }
      } else {
        throw error;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Next Steps:');
    console.log('1. Wait for index to become ACTIVE (1-3 minutes)');
    console.log('2. Test AI chat with: "Show me 2BHK in Hyderabad"');
    console.log('3. Vector search will understand semantic meaning!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('❌ Error creating vector index:', error.message);
    
    if (error.message?.includes('not supported')) {
      console.log('\n⚠️  Your MongoDB cluster may not support vector search.');
      console.log('   Requirements:');
      console.log('   - MongoDB Atlas M10+ cluster (not M0/M2/M5 free tier)');
      console.log('   - MongoDB version 6.0.11+ or 7.0.2+');
      console.log('\n   To create index manually:');
      console.log('   1. Go to https://cloud.mongodb.com/');
      console.log('   2. Navigate to Atlas Search → Create Index');
      console.log('   3. Use the JSON configuration from the script\n');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
};

// Run the script
createVectorIndex();
