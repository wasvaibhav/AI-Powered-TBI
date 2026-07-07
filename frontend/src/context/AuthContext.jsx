import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load the current user profile on startup if a token exists
  useEffect(() => {
    const loadUserProfile = async () => {
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            // Local token is expired or invalid
            logout();
          }
        } catch (err) {
          console.error("Network error fetching user session", err);
          // Do not logout automatically on pure network failure to prevent boot-out
        }
      }
      setIsLoading(false);
    };

    loadUserProfile();
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error during login (Status ${response.status})`);
    }

    const data = await response.json();
    
    // NOTE on Security Tradeoff: 
    // We are storing the JWT in localStorage for prototype convenience so the session 
    // persists across tabs/refreshes. In a production application, this introduces vulnerability 
    // to Cross-Site Scripting (XSS). An HttpOnly Cookie is the recommended production alternative.
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (name, email, phone, password) => {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, phone, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error during registration (Status ${response.status})`);
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Reusable API fetching wrapper that automatically injects JWT token
  const fetchWithAuth = async (url, options = {}) => {
    const headers = options.headers || {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      logout();
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
