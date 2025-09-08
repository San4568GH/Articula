import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import PostModel from './models/PostModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get current directory for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Migration Statistics
let migrationStats = {
  total: 0,
  migrated: 0,
  skipped: 0,
  errors: 0,
  details: []
};

/**
 * Upload local image to Cloudinary
 * @param {string} localPath - Path to local image file
 * @param {string} originalFilename - Original filename for better naming
 * @returns {Promise<string>} - Cloudinary URL
 */
async function uploadToCloudinary(localPath, originalFilename) {
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);
    const publicId = `${name}_${timestamp}`;

    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'Articula',
      public_id: publicId,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${localPath} to Cloudinary:`, error);
    throw error;
  }
}

/**
 * Check if file exists and is accessible
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if file exists and is accessible
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Get all image files from uploads directory
 * @returns {Array} - Array of image file paths
 */
function getLocalImages() {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('📂 Uploads directory does not exist. No images to migrate.');
    return [];
  }

  const files = fs.readdirSync(uploadsDir);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
  
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext);
  });
}

/**
 * Migrate a single post's image
 * @param {Object} post - Post document from database
 */
async function migratePost(post) {
  try {
    // Skip if cover is already a Cloudinary URL
    if (!post.cover || post.cover.startsWith('http://') || post.cover.startsWith('https://')) {
      migrationStats.skipped++;
      migrationStats.details.push({
        postId: post._id,
        title: post.title,
        status: 'skipped',
        reason: 'Already using cloud URL or no cover image'
      });
      return;
    }

    // Construct local file path
    const localPath = path.join(__dirname, 'uploads', path.basename(post.cover));
    
    // Check if local file exists
    if (!fileExists(localPath)) {
      migrationStats.errors++;
      migrationStats.details.push({
        postId: post._id,
        title: post.title,
        status: 'error',
        reason: `Local file not found: ${localPath}`
      });
      console.log(`❌ File not found for post "${post.title}": ${localPath}`);
      return;
    }

    console.log(`📤 Uploading image for post: "${post.title}"`);
    
    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(localPath, path.basename(post.cover));
    
    // Update post in database
    await PostModel.findByIdAndUpdate(post._id, { cover: cloudinaryUrl });
    
    migrationStats.migrated++;
    migrationStats.details.push({
      postId: post._id,
      title: post.title,
      status: 'migrated',
      oldPath: post.cover,
      newUrl: cloudinaryUrl
    });
    
    console.log(`✅ Successfully migrated: "${post.title}"`);
    console.log(`   📁 Local: ${post.cover}`);
    console.log(`   ☁️  Cloud: ${cloudinaryUrl}`);
    
  } catch (error) {
    migrationStats.errors++;
    migrationStats.details.push({
      postId: post._id,
      title: post.title,
      status: 'error',
      reason: error.message
    });
    console.error(`❌ Error migrating post "${post.title}":`, error.message);
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    console.log('🚀 Starting Articula Image Migration to Cloudinary');
    console.log('================================================');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    
    // Get all posts with cover images
    console.log('📋 Fetching posts from database...');
    const posts = await PostModel.find({ cover: { $exists: true, $ne: '' } });
    migrationStats.total = posts.length;
    
    console.log(`📊 Found ${posts.length} posts with cover images`);
    
    if (posts.length === 0) {
      console.log('🎉 No posts found with cover images. Migration completed.');
      return;
    }
    
    // List local images for reference
    const localImages = getLocalImages();
    console.log(`📁 Found ${localImages.length} images in uploads folder`);
    
    // Migrate each post
    console.log('\n🔄 Starting migration process...');
    console.log('================================');
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`\n[${i + 1}/${posts.length}] Processing post: "${post.title}"`);
      await migratePost(post);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Migration summary
    console.log('\n🎯 Migration Summary');
    console.log('===================');
    console.log(`📊 Total posts processed: ${migrationStats.total}`);
    console.log(`✅ Successfully migrated: ${migrationStats.migrated}`);
    console.log(`⏭️  Skipped: ${migrationStats.skipped}`);
    console.log(`❌ Errors: ${migrationStats.errors}`);
    
    if (migrationStats.errors > 0) {
      console.log('\n❌ Posts with errors:');
      migrationStats.details.filter(d => d.status === 'error').forEach(detail => {
        console.log(`   - ${detail.title}: ${detail.reason}`);
      });
    }
    
    if (migrationStats.migrated > 0) {
      console.log('\n✅ Successfully migrated posts:');
      migrationStats.details.filter(d => d.status === 'migrated').forEach(detail => {
        console.log(`   - ${detail.title}`);
      });
    }
    
    // Generate migration report
    const reportPath = path.join(__dirname, 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats: migrationStats,
      details: migrationStats.details
    }, null, 2));
    
    console.log(`\n📄 Detailed migration report saved to: ${reportPath}`);
    
    if (migrationStats.migrated > 0) {
      console.log('\n🧹 Optional: Clean up local files');
      console.log('After verifying all images are working correctly, you can:');
      console.log('1. Remove the /uploads folder');
      console.log('2. Remove the static file serving middleware from server.js');
      console.log('3. Update your .gitignore to exclude uploads folder');
    }
    
    console.log('\n🎉 Migration process completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
  }
}

/**
 * Rollback function to revert migration (optional)
 */
async function rollbackMigration() {
  try {
    console.log('🔄 Starting rollback process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Read migration report
    const reportPath = path.join(__dirname, 'migration-report.json');
    if (!fs.existsSync(reportPath)) {
      console.log('❌ No migration report found. Cannot rollback.');
      return;
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const migratedPosts = report.details.filter(d => d.status === 'migrated');
    
    console.log(`🔄 Rolling back ${migratedPosts.length} posts...`);
    
    for (const detail of migratedPosts) {
      await PostModel.findByIdAndUpdate(detail.postId, { cover: detail.oldPath });
      console.log(`✅ Rolled back: ${detail.title}`);
    }
    
    console.log('🎉 Rollback completed successfully!');
    
  } catch (error) {
    console.error('💥 Rollback failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const command = args[0];

if (command === 'rollback') {
  rollbackMigration();
} else {
  runMigration();
}

export { runMigration, rollbackMigration };
