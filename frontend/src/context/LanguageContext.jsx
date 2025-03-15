// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Initialize from localStorage, defaulting to "en"
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "fr" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
