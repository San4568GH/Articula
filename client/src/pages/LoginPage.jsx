import { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

//Code for Login Page
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);
  async function login(ev) {
    ev.preventDefault();
    try {
      const response = await fetch('https://articula-backend.vercel.app/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        alert('Wrong credentials! Try Again');
        throw new Error('Failed to Login');
      }
      else {
        const userInfo = await response.json();
        setUserInfo(userInfo);
        console.log('Login successful:', userInfo);
        alert('Logged in succesfully!');
        setRedirect(true);
      }
    } catch (error) {
      console.error('Error during Login:', error);
    }
  }


  useEffect(() => {
    if (redirect) {
      window.location.reload(); // Refresh the page after redirection
    }
  }, [redirect]);

  if (redirect) {
    return <Navigate to={'/'} />;
  }

  return (
    <form className="login" onSubmit={login}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
