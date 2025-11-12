/**
 * Smart Image Loader - Downloads & Uploads Property Images to S3
 * Run with: npx ts-node scripts/load-images-to-s3.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import { s3, S3_BUCKET } from '../src/config/aws';
import Property from '../src/models/Property.model';
import fs from 'fs';
import { promisify } from 'util';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

// Unsplash image URLs by property type
const imageCategories = {
  'apartment': [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', // modern apartment
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', // apartment interior
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', // living room
  ],
  'villa': [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811', // luxury villa
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', // villa exterior
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', // modern villa
  ],
  'independent-house': [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994', // modern house
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // house exterior
    'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4', // residential house
  ]
};

/**
 * Clean up all files in S3 bucket
 */
async function cleanupS3(): Promise<void> {
  console.log('🗑️  Cleaning up old S3 files...\n');

  try {
    // List all objects in bucket
    const listedObjects = await s3.listObjectsV2({
      Bucket: S3_BUCKET
    }).promise();

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log('✅ S3 bucket is already empty\n');
      return;
    }

    console.log(`Found ${listedObjects.Contents.length} files in S3`);

    // Delete all objects
    const deleteParams = {
      Bucket: S3_BUCKET,
      Delete: {
        Objects: listedObjects.Contents.map(item => ({ Key: item.Key! }))
      }
    };

    const deleted = await s3.deleteObjects(deleteParams).promise();
    console.log(`✅ Deleted ${deleted.Deleted?.length || 0} files from S3\n`);

  } catch (error: any) {
    console.error('❌ Error cleaning S3:', error.message);
    throw error;
  }
}

/**
 * Download image from URL
 */
async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await axios({
    url: `${url}?w=800&h=600&fit=crop`, // Unsplash parameters for optimization
    method: 'GET',
    responseType: 'arraybuffer',
    timeout: 30000
  });

  await writeFile(filepath, response.data);
}

/**
 * Upload image to S3
 */
async function uploadToS3(filepath: string, key: string): Promise<string> {
  const fileContent = fs.readFileSync(filepath);

  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: 'image/jpeg',
    ACL: 'public-read' as const
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}

/**
 * Process images for a single property
 */
async function processPropertyImages(
  property: any,
  tempDir: string,
  propertyIndex: number
): Promise<any[]> {
  const images: any[] = [];
  const propertyType = property.propertyType as keyof typeof imageCategories;
  const imageUrls = imageCategories[propertyType] || imageCategories['apartment'];

  for (let i = 0; i < 3; i++) {
    try {
      const imageUrl = imageUrls[i % imageUrls.length];
      const timestamp = Date.now();
      const filename = `property-${propertyIndex}-${i}-${timestamp}.jpg`;
      const filepath = path.join(tempDir, filename);
      const s3Key = `properties/${property._id}/${filename}`;

      // Download image
      await downloadImage(imageUrl, filepath);

      // Upload to S3
      const s3Url = await uploadToS3(filepath, s3Key);

      // Clean up temp file
      await unlink(filepath);

      images.push({
        url: s3Url,
        key: s3Key,
        isCover: i === 0,
        order: i
      });

    } catch (error: any) {
      console.error(`   ⚠️  Failed to process image ${i + 1}:`, error.message);
    }
  }

  return images;
}

/**
 * Main function
 */
async function loadImagesToS3() {
  const tempDir = path.join(__dirname, '../temp-images');

  try {
    console.log('🖼️  SMART IMAGE LOADER TO S3\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check AWS config
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured! Check your .env file.');
    }

    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected\n');

    // Create temp directory
    try {
      await mkdir(tempDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    // Clean up old S3 files
    await cleanupS3();

    // Get all properties
    const properties = await Property.find({}).select('_id title propertyType images');
    console.log(`📦 Found ${properties.length} properties\n`);
    console.log('⬇️  Downloading & uploading images to S3...\n');

    let successCount = 0;
    let failCount = 0;

    // Process each property
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const progress = Math.round(((i + 1) / properties.length) * 100);

      try {
        console.log(`[${i + 1}/${properties.length}] Processing: ${property.title}`);

        // Download and upload images
        const images = await processPropertyImages(property, tempDir, i);

        if (images.length > 0) {
          // Update property with S3 URLs
          await Property.findByIdAndUpdate(property._id, {
            images: images
          });

          console.log(`   ✅ Uploaded ${images.length} images (${progress}%)\n`);
          successCount++;
        } else {
          console.log(`   ⚠️  No images uploaded (${progress}%)\n`);
          failCount++;
        }

        // Progress indicator every 10 properties
        if ((i + 1) % 10 === 0) {
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`✅ Progress: ${i + 1}/${properties.length} (${progress}%)`);
          console.log(`   Success: ${successCount} | Failed: ${failCount}\n`);
        }

      } catch (error: any) {
        console.error(`   ❌ Error processing property: ${error.message}\n`);
        failCount++;
      }
    }

    // Cleanup temp directory
    try {
      fs.rmdirSync(tempDir);
    } catch (err) {
      // Ignore cleanup errors
    }

    // Final summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 IMAGE LOADING COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total properties:    ${properties.length}`);
    console.log(`Successfully loaded: ${successCount} ✅`);
    console.log(`Failed:              ${failCount} ❌`);
    console.log(`Total images:        ${successCount * 3} 🖼️`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 S3 Bucket Status:');
    const s3Objects = await s3.listObjectsV2({ Bucket: S3_BUCKET }).promise();
    console.log(`   Files in S3: ${s3Objects.KeyCount || 0}`);
    console.log(`   Bucket: ${S3_BUCKET}\n`);

    console.log('🎯 Next Steps:');
    console.log('1. Refresh your frontend: http://localhost:3000');
    console.log('2. Check property images - should load from S3 now!');
    console.log('3. Test app performance with real images\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'NoSuchBucket') {
      console.log('\n💡 Tip: Create S3 bucket first or check bucket name in .env');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Run
loadImagesToS3();
