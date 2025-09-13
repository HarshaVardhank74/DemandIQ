import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import jwt_decode from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedUser = jwt_decode(token);
            // Check if token is expired
            if (decodedUser.exp * 1000 > Date.now()) {
                setUser(decodedUser);
            } else {
                localStorage.removeItem('token');
            }
        }
    } catch (error) {
        console.error("Failed to decode token", error);
        localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // FastAPI's OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    const decodedUser = jwt_decode(access_token);
    setUser(decodedUser);
  };

  const register = async (email, password) => {
    await api.post('/auth/register', { email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};