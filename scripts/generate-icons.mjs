import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');

async function generateIcons() {
  const svg192 = readFileSync(resolve(publicDir, 'pwa-192x192.svg'));
  const svg512 = readFileSync(resolve(publicDir, 'pwa-512x512.svg'));
  const svgApple = readFileSync(resolve(publicDir, 'apple-touch-icon.svg'));

  // Generate 192x192 PNG
  await sharp(svg192)
    .resize(192, 192)
    .png()
    .toFile(resolve(publicDir, 'pwa-192x192.png'));
  console.log('✅ Generated pwa-192x192.png');

  // Generate 512x512 PNG
  await sharp(svg512)
    .resize(512, 512)
    .png()
    .toFile(resolve(publicDir, 'pwa-512x512.png'));
  console.log('✅ Generated pwa-512x512.png');

  // Generate apple-touch-icon 180x180 PNG
  await sharp(svgApple)
    .resize(180, 180)
    .png()
    .toFile(resolve(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Generated apple-touch-icon.png (180x180)');

  // Generate favicon 32x32 PNG
  await sharp(svg192)
    .resize(32, 32)
    .png()
    .toFile(resolve(publicDir, 'favicon-32x32.png'));
  console.log('✅ Generated favicon-32x32.png');

  // Generate favicon 16x16 PNG
  await sharp(svg192)
    .resize(16, 16)
    .png()
    .toFile(resolve(publicDir, 'favicon-16x16.png'));
  console.log('✅ Generated favicon-16x16.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
