/**
 * Smart Property Generator - Creates 50+ realistic properties
 * Run with: npx ts-node scripts/seed-50-properties.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Property from '../src/models/Property.model';
import User from '../src/models/User.model';

// Property data templates
const cityData = {
  hyderabad: {
    state: 'Telangana',
    areas: ['Gachibowli', 'Jubilee Hills', 'KPHB', 'Madhapur', 'Hitech City', 'Kondapur', 'Banjara Hills', 'Kompally', 'Manikonda', 'Financial District'],
    priceMultiplier: 1.0,
    landmarks: ['Metro Station', 'DLF Cyber City', 'Hitech City', 'Inorbit Mall', 'GVK One Mall']
  },
  bangalore: {
    state: 'Karnataka',
    areas: ['Whitefield', 'Sarjapur Road', 'HSR Layout', 'Koramangala', 'Indiranagar', 'Electronic City', 'Marathahalli', 'JP Nagar', 'Yelahanka', 'Bellandur'],
    priceMultiplier: 1.15,
    landmarks: ['Phoenix Marketcity', 'Metro Station', 'Wipro Corporate Office', 'Tech Parks', 'Forum Mall']
  },
  mumbai: {
    state: 'Maharashtra',
    areas: ['Andheri West', 'Powai', 'Borivali', 'Thane', 'Bandra', 'Goregaon', 'Malad', 'Kandivali', 'Worli', 'Lower Parel'],
    priceMultiplier: 2.0,
    landmarks: ['Metro Station', 'Railway Station', 'Powai Lake', 'International Airport', 'Shopping Mall']
  },
  delhi: {
    state: 'Delhi',
    areas: ['Dwarka', 'Rohini', 'Vasant Kunj', 'Greater Kailash', 'Saket', 'Janakpuri', 'Mayur Vihar', 'Pitampura', 'Noida', 'Gurgaon'],
    priceMultiplier: 1.8,
    landmarks: ['Metro Station', 'Select Citywalk', 'DLF Mall', 'Airport', 'Business District']
  },
  pune: {
    state: 'Maharashtra',
    areas: ['Hinjewadi', 'Wakad', 'Baner', 'Kharadi', 'Viman Nagar', 'Magarpatta', 'Aundh', 'Koregaon Park'],
    priceMultiplier: 0.9,
    landmarks: ['Rajiv Gandhi Infotech Park', 'Phoenix Mall', 'Metro Station', 'IT Parks']
  },
  chennai: {
    state: 'Tamil Nadu',
    areas: ['OMR', 'Anna Nagar', 'T Nagar', 'Velachery', 'Adyar', 'Sholinganallur', 'Thoraipakkam', 'Perungudi'],
    priceMultiplier: 1.0,
    landmarks: ['IT Park', 'Phoenix Mall', 'Metro Station', 'Beach Road']
  },
  kolkata: {
    state: 'West Bengal',
    areas: ['Salt Lake', 'New Town', 'Ballygunge', 'Park Street', 'Rajarhat', 'Howrah'],
    priceMultiplier: 0.7,
    landmarks: ['City Centre', 'Metro Station', 'IT Hub', 'Shopping Complex']
  },
  ahmedabad: {
    state: 'Gujarat',
    areas: ['Satellite', 'Prahlad Nagar', 'Bodakdev', 'SG Highway', 'Vastrapur'],
    priceMultiplier: 0.65,
    landmarks: ['ISCON Mall', 'Metro Station', 'Business District']
  }
};

const propertyTypes = ['apartment', 'villa', 'independent-house'] as const;
const amenitiesList = [
  'Swimming Pool', 'Gymnasium', 'Club House', '24/7 Security', 'Lift', 
  'Power Backup', 'Children Play Area', 'Parking', 'Garden', 'Intercom',
  'CCTV', 'Visitor Parking', 'Jogging Track', 'Party Hall', 'Rainwater Harvesting'
];

/**
 * Generate random property images
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
    const randomId = Math.floor(Math.random() * 10000);
    images.push({
      url: `https://source.unsplash.com/800x600/?${query}&sig=${randomId}`,
      key: `unsplash-${query}-${randomId}`,
      isCover: i === 0,
      order: i
    });
  }

  return images;
};

/**
 * Calculate realistic price based on location, type, and size
 */
const calculatePrice = (
  city: string,
  bedrooms: number,
  carpetArea: number,
  propertyType: string
): number => {
  const cityInfo = cityData[city as keyof typeof cityData];
  const basePrice = 5000; // Base price per sqft
  
  let pricePerSqft = basePrice * cityInfo.priceMultiplier;
  
  // Property type multiplier
  if (propertyType === 'villa') pricePerSqft *= 1.3;
  if (propertyType === 'independent-house') pricePerSqft *= 1.2;
  
  // Bedroom multiplier
  if (bedrooms >= 4) pricePerSqft *= 1.15;
  
  const totalPrice = Math.round(carpetArea * pricePerSqft / 100000) * 100000;
  return totalPrice;
};

/**
 * Generate random amenities
 */
const generateAmenities = (propertyType: string, bedrooms: number): string[] => {
  const baseAmenities = ['Lift', '24/7 Security', 'Power Backup'];
  const count = propertyType === 'villa' ? 8 : bedrooms >= 3 ? 6 : 4;
  
  const shuffled = [...amenitiesList].sort(() => 0.5 - Math.random());
  return [...new Set([...baseAmenities, ...shuffled.slice(0, count - 3)])];
};

/**
 * Generate property description
 */
const generateDescription = (
  propertyType: string,
  bedrooms: number,
  area: string,
  city: string
): string => {
  const templates = [
    `Premium ${bedrooms}BHK ${propertyType} in ${area}, ${city}. Modern amenities and excellent connectivity to major tech parks and shopping centers.`,
    `Spacious ${bedrooms}BHK ${propertyType} located in prime ${area}. Perfect for families with easy access to schools, hospitals, and metro stations.`,
    `Luxurious ${bedrooms} bedroom ${propertyType} in ${area}. Gated community with world-class amenities and 24/7 security.`,
    `Well-designed ${bedrooms}BHK ${propertyType} in ${area}, ${city}. Close to IT corridors, malls, and entertainment hubs. Great investment opportunity.`,
    `Beautiful ${bedrooms}BHK ${propertyType} in the heart of ${area}. Modern architecture with premium finishes and excellent ventilation.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * Generate a single property
 */
const generateProperty = (
  city: string,
  area: string,
  propertyType: typeof propertyTypes[number],
  bedrooms: number,
  userId: any
) => {
  const cityInfo = cityData[city as keyof typeof cityData];
  
  // Calculate realistic carpet area based on bedrooms
  const baseArea = propertyType === 'villa' ? 2000 : 
                   propertyType === 'independent-house' ? 1500 : 1000;
  const carpetArea = baseArea + (bedrooms - 2) * 300 + Math.floor(Math.random() * 200);
  
  const price = calculatePrice(city, bedrooms, carpetArea, propertyType);
  const amenities = generateAmenities(propertyType, bedrooms);
  const landmark = cityInfo.landmarks[Math.floor(Math.random() * cityInfo.landmarks.length)];
  
  const furnishingOptions: Array<'unfurnished' | 'semi-furnished' | 'fully-furnished'> = 
    ['unfurnished', 'semi-furnished', 'fully-furnished'];
  const furnishing = furnishingOptions[Math.floor(Math.random() * 3)];
  
  const ageOptions: Array<'<1' | '1-5' | '5-10' | '10+'> = ['<1', '1-5', '5-10', '10+'];
  const propertyAge = ageOptions[Math.floor(Math.random() * 3)]; // Bias toward newer

  return {
    title: `${bedrooms}BHK ${propertyType === 'apartment' ? 'Apartment' : 
             propertyType === 'villa' ? 'Villa' : 'Independent House'} in ${area}, ${city}`,
    description: generateDescription(propertyType, bedrooms, area, city),
    propertyType,
    listingType: 'sale' as const,
    address: {
      fullAddress: `${area}, ${city}, ${cityInfo.state}`,
      city: city.charAt(0).toUpperCase() + city.slice(1),
      state: cityInfo.state,
      pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
      landmark: `Near ${landmark}`
    },
    specs: {
      carpetArea,
      bedrooms,
      bathrooms: bedrooms >= 3 ? bedrooms : bedrooms + 1,
      balconies: Math.min(bedrooms, 3),
      parking: {
        covered: bedrooms >= 3 ? 2 : 1,
        open: 0
      },
      floor: propertyType === 'apartment' ? Math.floor(Math.random() * 15) + 1 : undefined,
      totalFloors: propertyType === 'apartment' ? Math.floor(Math.random() * 10) + 10 : undefined,
      propertyAge,
      furnishing,
      possession: Math.random() > 0.7 ? '1-month' as const : 'immediate' as const
    },
    amenities,
    pricing: {
      expectedPrice: price,
      priceNegotiable: Math.random() > 0.3,
      maintenanceCharges: Math.floor(carpetArea / 400) * 1000
    },
    images: generatePropertyImages(propertyType, 3),
    status: 'approved' as const,
    verified: true,
    stats: { views: 0, inquiries: 0, favorites: 0 },
    owner: userId,
    publishedAt: new Date()
  };
};

/**
 * Main seeding function
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 SMART PROPERTY GENERATOR - 50+ Properties\n');

    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected\n');

    // Create test users with different roles
    console.log('👥 Creating test users...\n');
    
    const testUsers = [
      {
        email: 'admin@indiapropertyads.com',
        password: 'admin12345678',
        phone: '9999999999',
        role: 'admin',
        name: 'Admin User'
      },
      {
        email: 'owner1@example.com',
        password: 'owner12345678',
        phone: '9876543210',
        role: 'owner',
        name: 'Rajesh Kumar'
      },
      {
        email: 'owner2@example.com',
        password: 'owner12345678',
        phone: '9876543211',
        role: 'owner',
        name: 'Priya Sharma'
      },
      {
        email: 'owner3@example.com',
        password: 'owner12345678',
        phone: '9876543212',
        role: 'owner',
        name: 'Amit Patel'
      },
      {
        email: 'agent1@example.com',
        password: 'agent12345678',
        phone: '9876543213',
        role: 'agent',
        name: 'Neha Reddy'
      },
      {
        email: 'agent2@example.com',
        password: 'agent12345678',
        phone: '9876543214',
        role: 'agent',
        name: 'Vikram Singh'
      },
      {
        email: 'buyer@example.com',
        password: 'buyer12345678',
        phone: '9876543215',
        role: 'buyer',
        name: 'Arun Gupta'
      }
    ];

    const createdUsers: any[] = [];
    
    for (const userData of testUsers) {
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        user = await User.create({
          email: userData.email,
          password: userData.password,
          phone: userData.phone,
          role: userData.role as 'buyer' | 'owner' | 'agent' | 'admin',
          profile: {
            name: userData.name
          },
          verification: {
            emailVerified: true,
            phoneVerified: true
          },
          isActive: true
        });
        console.log(`✅ Created ${userData.role}: ${userData.name}`);
      } else {
        console.log(`✓ Found ${userData.role}: ${userData.name}`);
      }
      
      createdUsers.push(user);
    }

    console.log(`\n📊 Total users: ${createdUsers.length}`);
    console.log('   1 Admin, 3 Owners, 2 Agents, 1 Buyer\n');
    
    // Get owner users for distributing properties
    const owners = createdUsers.filter(u => u.role === 'owner');

    console.log('📦 Generating properties...\n');

    const properties = [];
    
    // Hyderabad - 10 properties
    for (let i = 0; i < 10; i++) {
      const area = cityData.hyderabad.areas[i];
      const type = i < 6 ? 'apartment' : i < 8 ? 'villa' : 'independent-house';
      const bedrooms = [2, 2, 3, 3, 2, 4, 3, 4, 3, 2][i];
      const owner = owners[i % owners.length]; // Distribute among owners
      properties.push(generateProperty('hyderabad', area, type, bedrooms, owner._id));
    }

    // Bangalore - 10 properties
    for (let i = 0; i < 10; i++) {
      const area = cityData.bangalore.areas[i];
      const type = i < 7 ? 'apartment' : i < 9 ? 'villa' : 'independent-house';
      const bedrooms = [2, 3, 2, 3, 4, 2, 3, 4, 3, 2][i];
      const owner = owners[i % owners.length];
      properties.push(generateProperty('bangalore', area, type, bedrooms, owner._id));
    }

    // Mumbai - 8 properties
    for (let i = 0; i < 8; i++) {
      const area = cityData.mumbai.areas[i];
      const type = i < 6 ? 'apartment' : 'villa';
      const bedrooms = [2, 3, 2, 3, 4, 2, 3, 4][i];
      const owner = owners[i % owners.length];
      properties.push(generateProperty('mumbai', area, type, bedrooms, owner._id));
    }

    // Delhi NCR - 7 properties
    for (let i = 0; i < 7; i++) {
      const area = cityData.delhi.areas[i];
      const type = i < 5 ? 'apartment' : 'independent-house';
      const bedrooms = [2, 3, 2, 3, 4, 3, 4][i];
      const owner = owners[i % owners.length];
      properties.push(generateProperty('delhi', area, type, bedrooms, owner._id));
    }

    // Pune - 5 properties
    for (let i = 0; i < 5; i++) {
      const area = cityData.pune.areas[i];
      const type = i < 4 ? 'apartment' : 'villa';
      const bedrooms = [2, 3, 2, 3, 4][i];
      const owner = owners[i % owners.length];
      properties.push(generateProperty('pune', area, type, bedrooms, owner._id));
    }

    // Chennai - 5 properties
    for (let i = 0; i < 5; i++) {
      const area = cityData.chennai.areas[i];
      const type = i < 4 ? 'apartment' : 'independent-house';
      const bedrooms = [2, 3, 2, 3, 4][i];
      const owner = owners[i % owners.length];
      properties.push(generateProperty('chennai', area, type, bedrooms, owner._id));
    }

    // Kolkata - 3 properties
    for (let i = 0; i < 3; i++) {
      const area = cityData.kolkata.areas[i];
      const type = 'apartment';
      const bedrooms = [2, 3, 2][i];
      const owner = owners[i % owners.length];
      properties.push(generateProperty('kolkata', area, type, bedrooms, owner._id));
    }

    // Ahmedabad - 2 properties
    for (let i = 0; i < 2; i++) {
      const area = cityData.ahmedabad.areas[i];
      const type = 'apartment';
      const bedrooms = [2, 3][i];
      const owner = owners[i % owners.length];
      properties.push(generateProperty('ahmedabad', area, type, bedrooms, owner._id));
    }

    // Insert all properties
    console.log(`🚀 Inserting ${properties.length} properties...\n`);
    const inserted = await Property.insertMany(properties);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✨ Successfully added ${inserted.length} properties!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Show summary
    const summary: Record<string, number> = {};
    inserted.forEach(prop => {
      const city = prop.address.city;
      summary[city] = (summary[city] || 0) + 1;
    });

    console.log('📊 City-wise Distribution:');
    Object.entries(summary).forEach(([city, count]) => {
      console.log(`   ${city}: ${count} properties`);
    });

    const priceRanges = {
      'Budget (< 70L)': inserted.filter(p => p.pricing.expectedPrice < 7000000).length,
      'Mid-range (70L - 1.5Cr)': inserted.filter(p => p.pricing.expectedPrice >= 7000000 && p.pricing.expectedPrice < 15000000).length,
      'Premium (1.5Cr - 3Cr)': inserted.filter(p => p.pricing.expectedPrice >= 15000000 && p.pricing.expectedPrice < 30000000).length,
      'Luxury (3Cr+)': inserted.filter(p => p.pricing.expectedPrice >= 30000000).length
    };

    console.log('\n💰 Price Range Distribution:');
    Object.entries(priceRanges).forEach(([range, count]) => {
      console.log(`   ${range}: ${count} properties`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Next Steps:');
    console.log('1. Run vectorization: npx ts-node scripts/vectorize-properties.ts');
    console.log('2. Test property search: "Show me 2BHK in Hyderabad"');
    console.log('3. Test price estimation: "What\'s a 2BHK worth in Bangalore?"');
    console.log('4. Test across cities: "Properties in Mumbai under 2 crores"');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
};

// Run
seedDatabase();
