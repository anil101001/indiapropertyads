/**
 * Simple Image Loader - Uses existing S3 upload infrastructure
 * Run with: npx ts-node scripts/load-images-simple.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import { uploadImageToS3, deleteMultipleImages } from '../src/utils/imageUpload';
import { s3, S3_BUCKET } from '../src/config/aws';
import Property from '../src/models/Property.model';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Multer file interface
interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  fieldname: string;
  encoding: string;
  stream: any;
  destination: string;
  filename: string;
  path: string;
}

// High-quality Unsplash image IDs by category
const imagesByType = {
  'apartment': [
    'photo-1522708323590-d24dbb6b0267', // modern apartment
    'photo-1502672260266-1c1ef2d93688', // apartment interior
    'photo-1560448204-e02f11c3d0e2',   // living room
    'photo-1493809842364-78817add7ffb', // living space
    'photo-1484154218962-a197022b5858', // kitchen
  ],
  'villa': [
    'photo-1613490493576-7fde63acd811', // luxury villa
    'photo-1600596542815-ffad4c1539a9', // villa exterior
    'photo-1600607687939-ce8a6c25118c', // modern villa
    'photo-1512917774080-9991f1c4c750', // villa pool
    'photo-1600607687920-4e2a09cf159d', // villa garden
  ],
  'independent-house': [
    'photo-1568605114967-8130f3a36994', // modern house
    'photo-1600585154340-be6161a56a0c', // house exterior
    'photo-1600607687644-aac4c3eac7f4', // residential house
    'photo-1564013799919-ab600027ffc6', // house front
    'photo-1583608205776-bfd35f0d9f83', // house facade
  ]
};

/**
 * Cleanup old S3 images
 */
async function cleanupOldImages(): Promise<number> {
  try {
    const listedObjects = await s3.listObjectsV2({ Bucket: S3_BUCKET }).promise();
    
    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return 0;
    }

    const keys = listedObjects.Contents
      .filter(item => item.Key?.startsWith('properties/'))
      .map(item => item.Key!);

    if (keys.length > 0) {
      await deleteMultipleImages(keys);
    }

    return keys.length;
  } catch (error: any) {
    console.error('⚠️  Warning: Could not cleanup S3:', error.message);
    return 0;
  }
}

/**
 * Download image and convert to Multer format
 */
async function downloadAsMulterFile(
  imageId: string,
  filename: string
): Promise<MulterFile> {
  const url = `https://images.unsplash.com/${imageId}?w=800&h=600&fit=crop&q=80`;
  
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
    timeout: 30000
  });

  // Convert to Multer.File format
  return {
    buffer: Buffer.from(response.data),
    originalname: filename,
    mimetype: 'image/jpeg',
    size: response.data.byteLength,
    fieldname: 'images',
    encoding: '7bit',
    stream: null as any,
    destination: '',
    filename: filename,
    path: ''
  };
}

/**
 * Load images for a single property
 */
async function loadPropertyImages(
  property: any,
  index: number
): Promise<any[]> {
  const images: any[] = [];
  const propertyType = property.propertyType as keyof typeof imagesByType;
  const imageIds = imagesByType[propertyType] || imagesByType['apartment'];

  try {
    // Download and upload 3 images
    for (let i = 0; i < 3; i++) {
      const imageId = imageIds[i % imageIds.length];
      const filename = `property-${property._id}-${i}.jpg`;

      // Download image
      const multerFile = await downloadAsMulterFile(imageId, filename);

      // Upload to S3 using existing infrastructure
      const uploaded = await uploadImageToS3(multerFile, 'properties');

      images.push({
        url: uploaded.url,
        key: uploaded.key,
        isCover: i === 0,
        order: i
      });
    }

    return images;

  } catch (error: any) {
    console.error(`   ❌ Failed to load images: ${error.message}`);
    return [];
  }
}

/**
 * Main function
 */
async function loadImages() {
  try {
    console.log('🖼️  SIMPLE IMAGE LOADER (Using Existing S3 Infrastructure)\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check AWS config
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured! Check your .env file.');
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected\n');

    // Cleanup old images
    console.log('🗑️  Cleaning up old S3 images...');
    const deletedCount = await cleanupOldImages();
    console.log(`✅ Cleaned up ${deletedCount} old images\n`);

    // Get all properties
    const properties = await Property.find({})
      .select('_id title propertyType images')
      .lean();
    
    console.log(`📦 Found ${properties.length} properties\n`);
    console.log('⬆️  Uploading images to S3...\n');

    let successCount = 0;
    let failCount = 0;

    // Process each property
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const progress = Math.round(((i + 1) / properties.length) * 100);

      console.log(`[${i + 1}/${properties.length}] ${property.title}`);

      try {
        // Load and upload images
        const images = await loadPropertyImages(property, i);

        if (images.length > 0) {
          // Update property
          await Property.findByIdAndUpdate(property._id, { images });
          console.log(`   ✅ Uploaded ${images.length} images (${progress}%)\n`);
          successCount++;
        } else {
          console.log(`   ⚠️  No images uploaded (${progress}%)\n`);
          failCount++;
        }

        // Progress indicator
        if ((i + 1) % 10 === 0) {
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`✅ Progress: ${i + 1}/${properties.length} (${progress}%)`);
          console.log(`   Success: ${successCount} | Failed: ${failCount}\n`);
        }

      } catch (error: any) {
        console.error(`   ❌ Error: ${error.message}\n`);
        failCount++;
      }
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

    // S3 status
    const s3Objects = await s3.listObjectsV2({ Bucket: S3_BUCKET }).promise();
    console.log('📊 S3 Bucket Status:');
    console.log(`   Files: ${s3Objects.KeyCount || 0}`);
    console.log(`   Bucket: ${S3_BUCKET}\n`);

    console.log('🎯 Next Steps:');
    console.log('1. Refresh frontend: http://localhost:3000');
    console.log('2. Images now loading from S3!');
    console.log('3. Test performance with real images\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'NoSuchBucket') {
      console.log('\n💡 Create S3 bucket or check AWS_S3_BUCKET in .env');
    }
    
    if (error.code === 'InvalidAccessKeyId') {
      console.log('\n💡 Check AWS credentials in .env file');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Run
loadImages();
