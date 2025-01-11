import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { UserContext } from "./UserContext"

//Code to Implement the Header and make it change based on Login
export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  //------------------------------------------------------------------------------------------------------
  // useEffect(()=>
  // {
  //   fetch('https://articula-backend.vercel.app/profile',{
  //     credentials:'include',
  //   }).then(response=>{
  //     response.json().then(userInfo=>{
  //     setUserInfo(userInfo);
  //     })
  //   })
  // },[setUserInfo]);
  //------------------------------------------------------------------------------------------------------
  //the below useEffect is same useEffect written above,but in async,await--->>>

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('https://articula-backend.vercel.app/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const userInfo = await response.json();
          setUserInfo(userInfo);
        } else {
          console.error('Failed to fetch profile', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [setUserInfo]);



  //logout function
  async function logout() {
    const confirmLogout = window.confirm('Are you sure you want to log out?');

    if (confirmLogout) {
      try {
        const response = await fetch('https://articula-backend.vercel.app/logout', {
          credentials: 'include',
          method: 'POST',
        });

        if (response.ok) {
          // Logout successful
          alert('Successfully Logged out.')
          setUserInfo(null);
          console.log('Logged out successfully');
        } else {
          // Handle unsuccessful logout
          alert('Unexpected Error while logging out')
          console.error('Failed to log out');
        }
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  }

  const username = userInfo?.username;


  return (
    <header>
      <Link to="/" className="logo">Articula</Link>
      <nav>
        {username && (
          <>
            <span>Hello,<b>{username}</b>!!</span>
            <Link to='/create'>Create new Post</Link>
            <a onClick={logout}>Logout</a>
          </>
        )
        }
        {!username && (
          <>
            <Link to="/login">Login</Link>

            <Link to="/register">Register</Link>
          </>
        )}

      </nav>
    </header>
  )
}