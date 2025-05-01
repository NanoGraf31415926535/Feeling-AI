import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '/src/contexts/AuthContext.jsx';

function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn: authContextSignIn, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('SignIn: useEffect - isAuthenticated:', isAuthenticated, 'loading:', loading);
    if (isAuthenticated && !loading) {
      console.log('SignIn: useEffect - navigating to /');
      navigate('/');
    }
  }, [isAuthenticated, navigate, loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('SignIn: handleSubmit called with', { username, password });

    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('SignIn: handleSubmit - Response:', response, 'Data:', data);

      if (response.ok) {
        console.log('SignIn: handleSubmit - Login successful, calling authContextSignIn');
        localStorage.setItem('authToken', data.token);
        const signInSuccess = await authContextSignIn(username, password);
        console.log('SignIn: handleSubmit - authContextSignIn returned:', signInSuccess, 'isAuthenticated:', isAuthenticated, 'loading:', loading);
        // Navigation is now handled in the useEffect hook
      } else if (response.status === 401) {
        setError(data.error || 'Invalid username or password');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('SignIn: handleSubmit - Login error:', error);
      setError('Failed to connect to the server');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-purple-400">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-gray-300 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-1 bg-gray-800"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-gray-300 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-1 bg-gray-800"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {error && <p className="text-red-500">{error}</p>}
            <div className="text-sm">
              <Link to="/register" className="font-medium text-purple-400 hover:text-purple-500">
                Create an account
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignIn;