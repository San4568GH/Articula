
import Post from './Post'
import Header from './Header'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { UserContextProvider } from './UserContext'
import NewPost from './pages/NewPost'
import PostPage from './pages/PostPage'
import EditPost from './pages/EditPost'


function App() {
   return (
      <UserContextProvider>
         <Routes>
            <Route path='/' element={<Layout />}>
               <Route index element={<HomePage></HomePage>} />
               <Route path={'/login'} element={<LoginPage></LoginPage>} />
               <Route path={'/register'} element={<RegisterPage></RegisterPage>} />
               <Route path={'/create'} element={<NewPost />} />
               <Route path={'/post/:id'} element={<PostPage></PostPage>} />
               <Route path={'/edit/:id'} element={<EditPost></EditPost>} />
            </Route>
         </Routes>

      </UserContextProvider>





   )
}

export default App
