import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isFirstMount = useRef(true);

  const setAuthTokenState = (newToken) => {
    setAuthToken(newToken);
  };

  const setIsAuthenticatedState = (newIsAuthenticated) => {
    setIsAuthenticated(newIsAuthenticated);
  };

  const setUserState = (newUser) => {
    setUser(newUser);
  };

  const setLoadingState = (newLoading) => {
    setLoading(newLoading);
  };

  const signIn = useCallback(async (username, password) => {
    setLoadingState(true);
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setAuthTokenState(data.token);
        setIsAuthenticatedState(true);
        setUserState({ username });
        setLoadingState(false);
        return true;
      } else {
        setIsAuthenticatedState(false);
        setAuthTokenState(null);
        setUserState(null);
        setLoadingState(false);
        return false;
      }
    } catch (error) {
      setIsAuthenticatedState(false);
      setAuthTokenState(null);
      setUserState(null);
      setLoadingState(false);
      console.error('AuthContext: signIn error:', error);
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('authToken');
    setAuthTokenState(null);
    setIsAuthenticatedState(false);
    setUserState(null);
    navigate('/signin');
  }, [navigate]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setAuthTokenState(storedToken);
        setIsAuthenticatedState(true);
        setUserState(null);
      } else {
        setIsAuthenticatedState(false);
        setAuthTokenState(null);
        setUserState(null);
      }
      setLoadingState(false);
    }
  }, []);

  const value = { user, authToken, isAuthenticated, loading, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading authentication...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);