import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      // Set the token in the API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const { data } = await api.post('/login', formData);
      
      // Ensure phone_number is properly set and handle both phone and phone_number for backward compatibility
      const userData = data.user;
      if (userData.phone && !userData.phone_number) {
        userData.phone_number = userData.phone;
      } else if (userData.phone_number && !userData.phone) {
        userData.phone = userData.phone_number;
      }
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set the token in the API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const userPayload = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone || '',
        address: userData.address || ''
      };
      
      await api.post('/signup', userPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // After successful signup, log the user in
      return await login(userData.email, userData.password);
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Signup failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;