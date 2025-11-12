import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from '../src/models/Property.model';
import { generatePropertyEmbedding } from '../src/services/embedding.service';
import logger from '../src/utils/logger';

dotenv.config();

interface VectorizationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  alreadyVectorized: number;
}

/**
 * Vectorize all properties in the database
 * Run with: npx ts-node scripts/vectorize-properties.ts
 */
async function vectorizeAllProperties() {
  const stats: VectorizationStats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    alreadyVectorized: 0
  };

  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB\n');

    // Check if vectorization is enabled
    if (process.env.ENABLE_VECTORIZATION !== 'true') {
      console.log('⚠️  Vectorization is disabled!');
      console.log('Set ENABLE_VECTORIZATION=true in .env to enable\n');
      process.exit(0);
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OPENAI_API_KEY not found in .env');
      console.log('Please add your OpenAI API key to continue\n');
      process.exit(1);
    }

    // Find properties that need vectorization
    console.log('🔍 Finding properties to vectorize...');
    
    // Option 1: Vectorize all properties without embeddings
    const query = { embedding: { $exists: false } };
    
    // Option 2: Re-vectorize all (uncomment to force update)
    // const query = {};
    
    // Option 3: Vectorize only approved properties
    // const query = { embedding: { $exists: false }, status: 'approved' };
    
    const properties = await Property.find(query);
    stats.total = properties.length;

    if (properties.length === 0) {
      console.log('✅ No properties to vectorize!\n');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${properties.length} properties to vectorize\n`);
    console.log('🚀 Starting vectorization...\n');

    // Progress tracking
    const startTime = Date.now();
    let lastLogTime = Date.now();

    // Vectorize each property
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];

      try {
        // Generate embedding
        const embeddingResult = await generatePropertyEmbedding(property.toObject());

        if (!embeddingResult) {
          stats.skipped++;
          console.log(`⏭️  Skipped ${i + 1}/${properties.length}: ${property.title}`);
          continue;
        }

        // Update property with embedding
        property.embedding = embeddingResult.embedding;
        property.embeddingMetadata = {
          model: embeddingResult.model,
          generatedAt: new Date(),
          textUsed: embeddingResult.textUsed
        };

        await property.save();
        stats.success++;

        // Log progress every 10 properties or every 30 seconds
        const now = Date.now();
        if ((i + 1) % 10 === 0 || now - lastLogTime > 30000) {
          const elapsed = Math.floor((now - startTime) / 1000);
          const rate = stats.success / elapsed;
          const remaining = properties.length - (i + 1);
          const eta = Math.floor(remaining / rate);

          console.log(`✅ Progress: ${i + 1}/${properties.length} (${Math.floor(((i + 1) / properties.length) * 100)}%)`);
          console.log(`   Success: ${stats.success} | Skipped: ${stats.skipped} | Failed: ${stats.failed}`);
          console.log(`   Rate: ${rate.toFixed(2)}/sec | ETA: ${formatDuration(eta)}\n`);
          
          lastLogTime = now;
        }

        // Rate limiting: Pause every 100 requests
        if ((i + 1) % 100 === 0) {
          console.log('⏸️  Rate limit pause: waiting 2 seconds...\n');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error: any) {
        stats.failed++;
        console.error(`❌ Error vectorizing ${property.title}:`, error.message);
      }
    }

    // Summary
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 VECTORIZATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total properties:    ${stats.total}`);
    console.log(`Successfully vectorized: ${stats.success} ✅`);
    console.log(`Skipped:             ${stats.skipped} ⏭️`);
    console.log(`Failed:              ${stats.failed} ❌`);
    console.log(`Total time:          ${formatDuration(totalTime)}`);
    console.log(`Average rate:        ${(stats.success / totalTime).toFixed(2)}/sec`);
    console.log('='.repeat(60) + '\n');

    // Estimate cost (OpenAI text-embedding-3-small: $0.020 per 1M tokens)
    const avgTokensPerProperty = 267; // ~200 words
    const totalTokens = stats.success * avgTokensPerProperty;
    const cost = (totalTokens / 1000000) * 0.020;
    console.log(`💰 Estimated cost: $${cost.toFixed(4)} USD\n`);

    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
}

// Run the script
vectorizeAllProperties();
