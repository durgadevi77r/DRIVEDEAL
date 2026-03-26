import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedIsAdmin = localStorage.getItem('isAdmin');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAdmin(storedIsAdmin === 'true');
    }
    setLoading(false);
  }, []);

  const login = (userData, admin = false) => {
    setUser(userData);
    setIsAdmin(admin);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAdmin', admin.toString());
  };

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.message || 'signupFailed' };
      }
    } catch (error) {
      return { success: false, error: 'serverError' };
    }
  };

  const loginWithEmailPassword = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        login(data.user, false);
        return { success: true };
      } else {
        return { success: false, error: 'invalidCredentials' };
      }
    } catch (error) {
      return { success: false, error: 'serverError' };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        login(data.user, true);
        return { success: true };
      }
      return { success: false, error: 'invalidCredentials' };
    } catch (error) {
      return { success: false, error: 'serverError' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const loginWithGoogle = async () => {
    try {
      // Simulate Google login by calling the mock backend endpoint
      const googleData = {
        name: 'Google User',
        email: 'user@gmail.com',
      };
      const response = await fetch(`${API_BASE_URL}/api/login/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData),
      });
      const data = await response.json();
      if (data.success) {
        login(data.user, false);
      }
    } catch (error) {
      console.error('Error in mock Google login:', error);
    }
  };

  const getUserInitial = () => {
    if (!user) return '';
    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name;
    if (displayName) return displayName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        login,
        logout,
        updateUser,
        loginWithGoogle,
        getUserInitial,
        isAuthenticated: !!user,
        signup,
        loginWithEmailPassword,
        adminLogin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

