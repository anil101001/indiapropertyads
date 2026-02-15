/**
 * Property Inventory Report
 * Run with: npx ts-node scripts/inventory-report.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Property from '../src/models/Property.model';
import '../src/models/User.model';

const report = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected\n');

    const allProperties = await Property.find()
      .select('title address propertyType listingType status pricing.expectedPrice owner createdAt specs.bedrooms specs.carpetArea images verified')
      .populate('owner', 'email profile.name')
      .sort({ createdAt: -1 })
      .lean();

    const total = allProperties.length;
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`  📊 PROPERTY INVENTORY REPORT — Total: ${total} properties`);
    console.log('═══════════════════════════════════════════════════════════════════\n');

    // --- By Status ---
    const statusCounts: Record<string, number> = {};
    allProperties.forEach((p: any) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    console.log('📋 BY STATUS:');
    Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).forEach(([status, count]) => {
      console.log(`   ${status.padEnd(20)} ${count}`);
    });

    // --- By Property Type ---
    const typeCounts: Record<string, number> = {};
    allProperties.forEach((p: any) => {
      typeCounts[p.propertyType] = (typeCounts[p.propertyType] || 0) + 1;
    });
    console.log('\n🏠 BY PROPERTY TYPE:');
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`   ${type.padEnd(25)} ${count}`);
    });

    // --- By Listing Type ---
    const listingCounts: Record<string, number> = {};
    allProperties.forEach((p: any) => {
      const lt = p.listingType || 'unknown';
      listingCounts[lt] = (listingCounts[lt] || 0) + 1;
    });
    console.log('\n📝 BY LISTING TYPE:');
    Object.entries(listingCounts).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
      console.log(`   ${type.padEnd(20)} ${count}`);
    });

    // --- By City ---
    const cityCounts: Record<string, number> = {};
    allProperties.forEach((p: any) => {
      const city = p.address?.city || 'Unknown';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });
    console.log('\n🌆 BY CITY:');
    Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).forEach(([city, count]) => {
      console.log(`   ${city.padEnd(25)} ${count}`);
    });

    // --- By State ---
    const stateCounts: Record<string, number> = {};
    allProperties.forEach((p: any) => {
      const state = p.address?.state || 'Unknown';
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    });
    console.log('\n🗺️  BY STATE:');
    Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).forEach(([state, count]) => {
      console.log(`   ${state.padEnd(25)} ${count}`);
    });

    // --- By Owner ---
    const ownerCounts: Record<string, { count: number; name: string }> = {};
    allProperties.forEach((p: any) => {
      const email = p.owner?.email || 'unknown';
      const name = p.owner?.profile?.name || 'unknown';
      if (!ownerCounts[email]) ownerCounts[email] = { count: 0, name };
      ownerCounts[email].count++;
    });
    console.log('\n👤 BY OWNER:');
    Object.entries(ownerCounts).sort((a, b) => b[1].count - a[1].count).forEach(([email, info]) => {
      console.log(`   ${info.name.padEnd(20)} (${email.padEnd(30)}) ${info.count} properties`);
    });

    // --- Price Range ---
    const prices = allProperties.map((p: any) => p.pricing?.expectedPrice || 0).filter((p: number) => p > 0);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
      
      const formatINR = (n: number) => {
        if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
        if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
        return `₹${n.toLocaleString('en-IN')}`;
      };

      console.log('\n💰 PRICE RANGE:');
      console.log(`   Min:     ${formatINR(minPrice)}`);
      console.log(`   Max:     ${formatINR(maxPrice)}`);
      console.log(`   Average: ${formatINR(avgPrice)}`);
    }

    // --- By Property Type + City Matrix ---
    console.log('\n📊 PROPERTY TYPE × CITY MATRIX:');
    const matrix: Record<string, Record<string, number>> = {};
    const allCities = new Set<string>();
    allProperties.forEach((p: any) => {
      const type = p.propertyType || 'unknown';
      const city = p.address?.city || 'Unknown';
      allCities.add(city);
      if (!matrix[type]) matrix[type] = {};
      matrix[type][city] = (matrix[type][city] || 0) + 1;
    });

    const cityList = Array.from(allCities).sort();
    const header = '   ' + 'Type'.padEnd(22) + cityList.map(c => c.padStart(14)).join('');
    console.log(header);
    console.log('   ' + '─'.repeat(header.length - 3));
    Object.entries(matrix).sort().forEach(([type, cities]) => {
      const row = cityList.map(c => String(cities[c] || 0).padStart(14)).join('');
      console.log(`   ${type.padEnd(22)}${row}`);
    });

    // --- Verified vs Unverified ---
    const verified = allProperties.filter((p: any) => p.verified).length;
    const unverified = total - verified;
    console.log(`\n✅ VERIFICATION: ${verified} verified, ${unverified} unverified`);

    // --- Properties with images vs without ---
    const withImages = allProperties.filter((p: any) => p.images && p.images.length > 0).length;
    const withoutImages = total - withImages;
    console.log(`📸 IMAGES: ${withImages} with images, ${withoutImages} without images`);

    // --- Monthly creation trend ---
    console.log('\n📅 MONTHLY CREATION TREND:');
    const monthCounts: Record<string, number> = {};
    allProperties.forEach((p: any) => {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    });
    Object.entries(monthCounts).sort().forEach(([month, count]) => {
      const bar = '█'.repeat(Math.min(count, 50));
      console.log(`   ${month}  ${bar} ${count}`);
    });

    // --- Full listing ---
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('  📋 FULL PROPERTY LISTING');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    allProperties.forEach((p: any, i: number) => {
      const ownerEmail = p.owner?.email || 'unknown';
      const ownerName = p.owner?.profile?.name || 'unknown';
      const price = p.pricing?.expectedPrice || 0;
      const formatINR = (n: number) => {
        if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
        if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
        return `₹${n.toLocaleString('en-IN')}`;
      };
      const imgCount = p.images?.length || 0;
      
      console.log(`${String(i + 1).padStart(3)}. [${p.status}] [${p.propertyType}] [${p.listingType || 'N/A'}] ${p.title}`);
      console.log(`     📍 ${p.address?.city || 'N/A'}, ${p.address?.state || 'N/A'} | 💰 ${formatINR(price)} | 📸 ${imgCount} imgs | 👤 ${ownerName} (${ownerEmail})`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log(`  ✅ Report complete — ${total} properties analyzed`);
    console.log('═══════════════════════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

report();
