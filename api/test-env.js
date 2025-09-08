import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔧 Environment Variables Test');
console.log('=============================');

// Test MongoDB
console.log('📊 MongoDB:');
console.log('  MONGO_URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ Missing');

// Test JWT
console.log('🔐 Authentication:');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');

// Test Cloudinary
console.log('☁️  Cloudinary:');
console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Loaded' : '❌ Missing');
console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Loaded' : '❌ Missing');

// Test Server
console.log('🚀 Server:');
console.log('  PORT:', process.env.PORT || '4000 (default)');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'development (default)');

console.log('\n✅ Environment test completed!');
console.log('If all values show "✅ Loaded", your environment is configured correctly.');

if (!process.env.MONGO_URI || !process.env.JWT_SECRET || !process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('\n❌ Some environment variables are missing!');
  console.log('Please check your .env file in the root directory.');
  process.exit(1);
} else {
  console.log('\n🎉 All required environment variables are present!');
}
