
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import UserModel from './models/UserModel.js';
import PostModel from './models/PostModel.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { upload, deleteFromCloudinary } from './config/cloudinary.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const secret = process.env.JWT_SECRET ;

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
console.log('CLOUDINARY_CLOUD_NAME loaded:', process.env.CLOUDINARY_CLOUD_NAME ? 'Yes' : 'No');

app.use(cors({ credentials: true, origin: ['http://localhost:5173'] }));
app.use(express.json());
app.use(cookieParser());

//MongoDB Connection
const mongoUri = process.env.MONGO_URI ;

mongoose.connect(mongoUri)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('Error connecting to MongoDB:', err));

  //Register Function
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDoc = new UserModel({ username, password });
    await userDoc.save();
    res.json(userDoc);
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

//Login Function
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const userDoc = await UserModel.findOne({ username });
    if (!userDoc) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: userDoc._id, username: userDoc.username }, secret, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Strict' });
    res.json({ message: 'Login successful', user: userDoc });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

//Profile Reading by cookies and JSONwebtoken
app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized access, token missing' });
  }

  jwt.verify(token, secret, (err, info) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized access, token invalid' });
    }
    res.json(info);
  });
});

//Logout function
app.post('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
});

//Creating New Post function
app.post('/post', upload.single('file'), async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized access, token missing' });
    }

    jwt.verify(token, secret, async (err, info) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized access, token invalid' });
      }
      
      const { title, summary, content } = req.body;
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }
      
      const postDoc = await PostModel.create({
        title,
        summary,
        content,
        cover: req.file.path, // Cloudinary returns the URL in req.file.path
        author: info.id,
      });

      res.json(postDoc);
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Updating/Editing own post function
app.put('/post', upload.single('file'), async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized access, token missing' });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized access, token invalid' });
      }
      
      const { id, title, summary, content } = req.body;
      const postDoc = await PostModel.findById(id);
      
      if (!postDoc) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(403).json({ error: 'You are not the author' });
      }

      // Prepare update data
      const updateData = {
        title,
        summary,
        content,
      };

      // If new file uploaded, delete old image and use new one
      if (req.file) {
        // Delete old image from Cloudinary if it exists
        if (postDoc.cover) {
          try {
            await deleteFromCloudinary(postDoc.cover);
          } catch (error) {
            console.error('Error deleting old image:', error);
            // Continue with update even if deletion fails
          }
        }
        updateData.cover = req.file.path; // New Cloudinary URL
      }

      await postDoc.updateOne(updateData);
      res.json(postDoc);
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});


//Post Displaying in HomePage
app.get('/post', async (req, res) => {
  const posts = await PostModel.find()
    .populate('author', ['username'])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});

//Accessing Posts by ID,for Full Post View
app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  const postDoc = await PostModel.findById(id).populate('author', ['username']);
  res.json(postDoc);
});




const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});




