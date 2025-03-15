// src/main.jsx (or index.jsx)
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext"; 
import "./index.css";

// Removed <React.StrictMode> to avoid double-invocation in dev
createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </AuthProvider>
);
