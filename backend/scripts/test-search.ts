/**
 * Test search functionality
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Property from '../src/models/Property.model';
import { generateQueryEmbedding } from '../src/services/embedding.service';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testSearch = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected\n');

    console.log('━━━ ENVIRONMENT CHECK ━━━');
    console.log('ENABLE_VECTORIZATION:', process.env.ENABLE_VECTORIZATION);
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
    console.log();

    const query = 'properties in Hyderabad';
    console.log(`🔍 Testing search for: "${query}"\n`);

    // Test 1: Text Search
    console.log('━━━ TEST 1: TEXT SEARCH ━━━');
    const searchRegex = new RegExp(query, 'i');
    const textResults = await Property.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex },
        { 'address.fullAddress': searchRegex }
      ]
    }).limit(5);
    
    console.log(`Found ${textResults.length} properties`);
    textResults.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title} | ${p.address.city} | ${p.specs.bedrooms}BHK`);
    });
    console.log();

    // Test 2: Vector Search
    console.log('━━━ TEST 2: VECTOR SEARCH ━━━');
    
    if (process.env.ENABLE_VECTORIZATION !== 'true') {
      console.log('⚠️  ENABLE_VECTORIZATION is not true in .env');
      console.log('   Current value:', process.env.ENABLE_VECTORIZATION);
      process.exit(0);
    }

    console.log('Calling generateQueryEmbedding...');
    const queryEmbedding = await generateQueryEmbedding(query);
    console.log(`Generated query embedding: ${queryEmbedding?.length} dimensions`);
    console.log('Embedding result type:', typeof queryEmbedding);
    console.log('Is array?:', Array.isArray(queryEmbedding));
    
    if (!queryEmbedding) {
      console.log('❌ Failed to generate query embedding');
      console.log('Check backend logs for OpenAI API errors');
      process.exit(1);
    }

    const pipeline = [
      {
        $vectorSearch: {
          index: 'property_vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: 5
        }
      },
      {
        $addFields: {
          score: { $meta: 'vectorSearchScore' }
        }
      },
      {
        $project: {
          title: 1,
          'address.city': 1,
          'specs.bedrooms': 1,
          score: 1
        }
      }
    ];

    console.log('Running vector search...');
    const vectorResults = await Property.aggregate(pipeline);
    
    console.log(`Found ${vectorResults.length} properties`);
    vectorResults.forEach((p: any, i: number) => {
      console.log(`${i + 1}. ${p.title} | ${p.address.city} | ${p.specs.bedrooms}BHK | Score: ${p.score?.toFixed(4)}`);
    });

    console.log('\n✅ Test complete');
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
    process.exit(1);
  }
};

testSearch();
