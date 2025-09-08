import { runMigration } from './migrate-images.js';

console.log('🚀 Articula Image Migration Tool');
console.log('===============================');
console.log('This script will migrate all local images to Cloudinary');
console.log('Make sure you have:');
console.log('✅ Valid Cloudinary credentials in .env');
console.log('✅ MongoDB connection working');
console.log('✅ Backup of your database (recommended)');
console.log('');

// Run the migration
runMigration();
