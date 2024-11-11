import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthData, removeAuthData } from '../utils/authUtils';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('https://backend-olimpica.onrender.com/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setIsAuthenticated(true);
          setUser(response.data); 
        })
        .catch((error) => {
          setIsAuthenticated(false);
          setUser(null);
          console.error('Error de autenticación', error);
        });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('https://backend-olimpica.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      setAuthData(data.token); 
      setIsAuthenticated(true);
      navigate('/home'); 
      return true; 
    } catch (error) {
      return false; 
    }
  };

  // const login = async (username, password) => {
  //   try {
  //     const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
  //     localStorage.setItem('token', response.data.token);
  //     setIsAuthenticated(true);
  //     setUser(response.data.user); // Asumiendo que el backend devuelve los datos del usuario
  //     return true;
  //   } catch (error) {
  //     console.error('Error de login', error);
  //     return false;
  //   }
  // };

  const logout = () => {
    removeAuthData();
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    // <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
    //   {children}
    // </AuthContext.Provider>
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
