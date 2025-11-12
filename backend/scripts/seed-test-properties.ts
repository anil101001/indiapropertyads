/**
 * Seed database with clean test properties
 * Run with: npx ts-node scripts/seed-test-properties.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Property from '../src/models/Property.model';
import User from '../src/models/User.model';

/**
 * Generate random property images using Unsplash
 * Categories: apartment, house, villa, modern-home
 */
const generatePropertyImages = (propertyType: string, count: number = 3) => {
  const imageQueries: Record<string, string> = {
    'apartment': 'apartment-interior',
    'villa': 'luxury-villa',
    'independent-house': 'modern-house',
    'plot': 'real-estate-land'
  };

  const query = imageQueries[propertyType] || 'modern-home';
  const images = [];

  for (let i = 0; i < count; i++) {
    const randomId = Math.floor(Math.random() * 1000);
    images.push({
      url: `https://source.unsplash.com/800x600/?${query}&sig=${randomId}`,
      key: `unsplash-${query}-${randomId}`,
      isCover: i === 0, // First image is cover
      order: i
    });
  }

  return images;
};

const sampleProperties = [
  // Hyderabad Properties
  {
    title: '2BHK Apartment in Gachibowli, Hyderabad',
    description: 'Modern 2BHK apartment in the IT hub of Hyderabad. Close to major tech parks, shopping malls, and metro station. Perfect for IT professionals.',
    propertyType: 'apartment',
    listingType: 'sale',
    address: {
      fullAddress: 'Gachibowli, Hyderabad, Telangana 500032',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500032',
      landmark: 'Near DLF Cyber City'
    },
    specs: {
      carpetArea: 1200,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      parking: { covered: 1, open: 0 },
      floor: 5,
      totalFloors: 15,
      propertyAge: '<1',
      furnishing: 'semi-furnished',
      possession: 'immediate'
    },
    amenities: ['Swimming Pool', 'Gymnasium', 'Club House', '24/7 Security', 'Lift', 'Power Backup'],
    pricing: {
      expectedPrice: 8500000, // 85 lakhs
      priceNegotiable: true,
      maintenanceCharges: 3000
    },
    status: 'approved',
    verified: true,
    stats: { views: 0, inquiries: 0, favorites: 0 }
  },
  {
    title: '3BHK Luxury Apartment in Jubilee Hills, Hyderabad',
    description: 'Spacious 3BHK luxury apartment in prime Jubilee Hills location. Premium amenities, excellent connectivity, and upscale neighborhood.',
    propertyType: 'apartment',
    listingType: 'sale',
    address: {
      fullAddress: 'Jubilee Hills, Hyderabad, Telangana 500033',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      landmark: 'Near KBR Park'
    },
    specs: {
      carpetArea: 1800,
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      parking: { covered: 2, open: 0 },
      floor: 8,
      totalFloors: 12,
      propertyAge: '1-5',
      furnishing: 'fully-furnished',
      possession: 'immediate'
    },
    amenities: ['Swimming Pool', 'Gymnasium', 'Club House', '24/7 Security', 'Lift', 'Power Backup', 'Children Play Area', 'Intercom'],
    pricing: {
      expectedPrice: 18000000, // 1.8 crores
      priceNegotiable: true,
      maintenanceCharges: 5000
    },
    status: 'approved',
    verified: true,
    stats: { views: 0, inquiries: 0, favorites: 0 }
  },
  {
    title: '2BHK Affordable Flat in KPHB, Hyderabad',
    description: 'Budget-friendly 2BHK apartment in KPHB Colony. Good connectivity to Hitec City and Kukatpally. Ideal for first-time home buyers.',
    propertyType: 'apartment',
    listingType: 'sale',
    address: {
      fullAddress: 'KPHB Colony, Hyderabad, Telangana 500072',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500072',
      landmark: 'Near KPHB Metro Station'
    },
    specs: {
      carpetArea: 1000,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      parking: { covered: 1, open: 0 },
      floor: 3,
      totalFloors: 10,
      propertyAge: '1-5',
      furnishing: 'unfurnished',
      possession: 'immediate'
    },
    amenities: ['Lift', '24/7 Security', 'Power Backup', 'Parking'],
    pricing: {
      expectedPrice: 5500000, // 55 lakhs
      priceNegotiable: true,
      maintenanceCharges: 2000
    },
    status: 'approved',
    verified: true,
    stats: { views: 0, inquiries: 0, favorites: 0 }
  },

  // Bangalore Properties
  {
    title: '2BHK Apartment in Whitefield, Bangalore',
    description: 'Modern 2BHK in Bangalore IT corridor. Close to tech parks, international schools, and shopping centers. Excellent investment opportunity.',
    propertyType: 'apartment',
    listingType: 'sale',
    address: {
      fullAddress: 'Whitefield, Bangalore, Karnataka 560066',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      landmark: 'Near Phoenix Marketcity'
    },
    specs: {
      carpetArea: 1150,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      parking: { covered: 1, open: 0 },
      floor: 6,
      totalFloors: 14,
      propertyAge: '<1',
      furnishing: 'semi-furnished',
      possession: 'immediate'
    },
    amenities: ['Swimming Pool', 'Gymnasium', '24/7 Security', 'Lift', 'Club House', 'Power Backup'],
    pricing: {
      expectedPrice: 9500000, // 95 lakhs
      priceNegotiable: false,
      maintenanceCharges: 3500
    },
    status: 'approved',
    verified: true,
    stats: { views: 0, inquiries: 0, favorites: 0 }
  },
  {
    title: '3BHK Villa in Sarjapur Road, Bangalore',
    description: 'Premium 3BHK villa with private garden. Gated community with world-class amenities. Perfect for families seeking luxury living.',
    propertyType: 'villa',
    listingType: 'sale',
    address: {
      fullAddress: 'Sarjapur Road, Bangalore, Karnataka 560035',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560035',
      landmark: 'Near Wipro Corporate Office'
    },
    specs: {
      carpetArea: 2200,
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      parking: { covered: 2, open: 0 },
      propertyAge: '<1',
      furnishing: 'fully-furnished',
      possession: 'immediate'
    },
    amenities: ['Swimming Pool', 'Gymnasium', 'Club House', '24/7 Security', 'Children Play Area', 'Gated Community', 'Power Backup', 'Garden'],
    pricing: {
      expectedPrice: 25000000, // 2.5 crores
      priceNegotiable: true,
      maintenanceCharges: 8000
    },
    status: 'approved',
    verified: true,
    stats: { views: 0, inquiries: 0, favorites: 0 }
  },

  // Mumbai Properties
  {
    title: '2BHK Apartment in Andheri West, Mumbai',
    description: 'Well-connected 2BHK apartment in Andheri West. Close to metro station, shopping centers, and entertainment hubs. Prime Mumbai location.',
    propertyType: 'apartment',
    listingType: 'sale',
    address: {
      fullAddress: 'Andheri West, Mumbai, Maharashtra 400053',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      landmark: 'Near Andheri Metro Station'
    },
    specs: {
      carpetArea: 950,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      parking: { covered: 1, open: 0 },
      floor: 7,
      totalFloors: 18,
      propertyAge: '1-5',
      furnishing: 'semi-furnished',
      possession: 'immediate'
    },
    amenities: ['Lift', '24/7 Security', 'Gymnasium', 'Power Backup', 'Parking'],
    pricing: {
      expectedPrice: 18000000, // 1.8 crores
      priceNegotiable: true,
      maintenanceCharges: 4000
    },
    status: 'approved',
    verified: true,
    stats: { views: 0, inquiries: 0, favorites: 0 }
  },
  {
    title: '3BHK Apartment in Powai, Mumbai',
    description: 'Spacious 3BHK with lake view in Powai. Premium gated community with excellent amenities. Close to IIT Bombay and Hiranandani Gardens.',
    propertyType: 'apartment',
    listingType: 'sale',
    address: {
      fullAddress: 'Powai, Mumbai, Maharashtra 400076',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400076',
      landmark: 'Near Powai Lake'
    },
    specs: {
      carpetArea: 1650,
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      parking: { covered: 2, open: 0 },
      floor: 10,
      totalFloors: 20,
      propertyAge: '<1',
      furnishing: 'fully-furnished',
      possession: 'immediate'
    },
    amenities: ['Swimming Pool', 'Gymnasium', 'Club House', '24/7 Security', 'Lift', 'Power Backup', 'Children Play Area', 'Garden'],
    pricing: {
      expectedPrice: 28000000, // 2.8 crores
      priceNegotiable: false,
      maintenanceCharges: 6000
    },
    status: 'approved',
    verified: true,
    stats: { views: 0, inquiries: 0, favorites: 0 }
  },

  // Pune Properties
  {
    title: '2BHK Apartment in Hinjewadi, Pune',
    description: 'Modern 2BHK in Pune IT hub. Close to Rajiv Gandhi Infotech Park. Perfect for IT professionals working in Hinjewadi.',
    propertyType: 'apartment',
    listingType: 'sale',
    address: {
      fullAddress: 'Hinjewadi Phase 2, Pune, Maharashtra 411057',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411057',
      landmark: 'Near Rajiv Gandhi Infotech Park'
    },
    specs: {
      carpetArea: 1100,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      parking: { covered: 1, open: 0 },
      floor: 4,
      totalFloors: 12,
      propertyAge: '<1',
      furnishing: 'semi-furnished',
      possession: 'immediate'
    },
    amenities: ['Swimming Pool', 'Gymnasium', '24/7 Security', 'Lift', 'Club House', 'Power Backup'],
    pricing: {
      expectedPrice: 7500000, // 75 lakhs
      priceNegotiable: true,
      maintenanceCharges: 2500
    },
    status: 'approved',
    verified: true,
    stats: { views: 0, inquiries: 0, favorites: 0 }
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 SEEDING TEST DATA\n');

    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB\n');

    // Get or create a test user
    console.log('👤 Getting test user...');
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123', // Will be hashed by User model
        phone: '9876543210',
        role: 'user',
        isVerified: true
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user found');
    }

    console.log('\n📦 Adding properties...\n');

    // Add properties
    for (const propData of sampleProperties) {
      // Generate random images for this property
      const propertyImages = generatePropertyImages(propData.propertyType, 3);
      
      const property = await Property.create({
        ...propData,
        images: propertyImages,
        owner: testUser._id,
        publishedAt: new Date()
      });
      
      console.log(`✅ Added: ${property.title}`);
      console.log(`   Price: ₹${(property.pricing.expectedPrice / 100000).toFixed(2)} lakhs`);
      console.log(`   Location: ${property.address.city}`);
      console.log(`   Images: ${propertyImages.length} random photos\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✨ Successfully added ${sampleProperties.length} properties!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Summary:');
    console.log(`   Total Properties: ${sampleProperties.length}`);
    console.log(`   Hyderabad: 3`);
    console.log(`   Bangalore: 2`);
    console.log(`   Mumbai: 2`);
    console.log(`   Pune: 1\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Next Steps:');
    console.log('1. Run vectorization: npx ts-node scripts/vectorize-properties.ts');
    console.log('2. Test AI chat: "Show me 2BHK in Hyderabad"');
    console.log('3. Test price estimation: "What\'s a 2BHK worth in Hyderabad?"');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('\n❌ Error seeding database:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
};

// Run seeding
seedDatabase();
