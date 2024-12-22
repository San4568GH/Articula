
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import UserModel from './models/UserModel.js';
import PostModel from './models/PostModel.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const secret = '23jfizj34nkfppsf133mvjdai2er';
const uploadMiddleWare = multer({ dest: 'uploads/' });

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(cookieParser());

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the /uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//enables Cover upload from backend to frontend
//dirname in es6,__dirname in cj

//MongoDB Connection
mongoose.connect('process.env.MONGO_URL', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully'))
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
app.post('/post', uploadMiddleWare.single('file'), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const extension = parts[parts.length - 1];
  const newPath = path + '.' + extension;
  fs.renameSync(path, newPath);
  //res.json({files:req.file});   
  //^^this returns the params used in the code,from preview of networktab

  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized access, token missing' });
  }

  jwt.verify(token, secret, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized access, token invalid' });
    }
    const { title, summary, content } = req.body;
    const postDoc = await PostModel.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });

    res.json(postDoc);//Info about the doc
  });
});

// Updating/Editing own post function
app.put('/post', uploadMiddleWare.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const extension = parts[parts.length - 1];
    newPath = path + '.' + extension;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await PostModel.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });

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




app.listen(4000, () => {
  console.log('Server is running on port 4000');
});




