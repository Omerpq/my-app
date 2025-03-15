// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";

// Create the context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    const localUser = localStorage.getItem("user");
    return localUser ? JSON.parse(localUser) : null;
  });

  // Login: store user data in state and localStorage
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout: clear user data from state and localStorage
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);
