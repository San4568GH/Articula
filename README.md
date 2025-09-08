
# Articula

A full-stack blog posting website made with MERN stack, inspired by Medium's clean design and functionality.

## 🚀 Features

- Made in React+Vite frontend framework
- JWT user authentication with secure sessions
- MongoDB used for user info and post detail storage
- React-Quill for customizable text editing
- Cloudinary integration for cloud-based image storage and optimization
- Responsive design for all devices
- Real-time post creation and editing 

![HomePage](https://github.com/San4568GH/Articula/assets/118655067/1d0e77b3-63ef-422b-907a-1af3a4651b2b)

![PostPage](https://github.com/San4568GH/Articula/assets/118655067/04373a21-1133-4048-8eca-7baeff2c3870)

![Create/Edit Page](https://github.com/San4568GH/Articula/assets/118655067/703c97ee-d5d6-4e2f-97ac-2e844f8c10d9)

## 🛠️ Tech Stack

**Frontend:**
- React 18.2.0 with Vite
- React Router DOM for navigation
- React Context API for state management
- React Quill for rich text editing

**Backend:**
- Node.js with Express.js
- MongoDB Atlas for database
- Mongoose for data modeling
- JWT for authentication
- Cloudinary for image storage
- bcryptjs for password security




## Steps to open app

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git for version control

### Installation

1. Clone the repository:

   ```git clone https://github.com/San4568GH/Articula.git```
   
   or download the .zip file and extract.

2. Install dependencies:

   ```npm install```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your MongoDB URI, JWT secret, and Cloudinary credentials

4. Change directory to api:

   ```cd api```

5. Start backend server:

   ```npm run server:dev```

6. Start a new terminal and navigate to client:

   ```cd client```

7. Install dependencies:

   ```npm install```

8. Run frontend server:
 
   ```npm run dev```

9. Follow the localhost url (usually http://localhost:5173)

## 🔑 Key Features

- **Secure Authentication**: JWT-based login system with encrypted passwords
- **Rich Text Editor**: Full-featured editor with formatting options
- **Cloud Storage**: Cloudinary integration for optimized image delivery
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Dynamic content loading and user feedback

## 🌐 API Endpoints

- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /profile` - User profile retrieval
- `POST /post` - Create new blog post
- `PUT /post` - Update existing post
- `GET /post` - Retrieve all posts
- `GET /post/:id` - Get specific post

---



