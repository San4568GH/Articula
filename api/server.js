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

// Proper CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://articula.vercel.app'], // Allow both local and deployed frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  credentials: true // Allow cookies or authentication headers
}));

app.use(express.json());
app.use(cookieParser());

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the /uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect("mongodb+srv://blogapp:ZTPOCGiLYC2Fe1xp@cluster123.y9nlqx4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster123", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Register Function
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving
    const userDoc = new UserModel({ username, password: hashedPassword });
    await userDoc.save();
    res.json(userDoc);
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login Function
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
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'None' }); // Updated for modern security
    res.json({ message: 'Login successful', user: userDoc });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Profile Reading
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

// Logout Function
app.post('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0), sameSite: 'None', secure: true });
  res.json({ message: 'Logged out' });
});

app.get("/check", (req,res) => {
  res.send("Hi");
})

// Post Functions (Create, Update, Fetch, and View by ID)
app.post('/post', uploadMiddleWare.single('file'), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const extension = parts[parts.length - 1];
  const newPath = path + '.' + extension;
  fs.renameSync(path, newPath);

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

    res.json(postDoc);
  });
});

// Other routes omitted for brevity...

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
