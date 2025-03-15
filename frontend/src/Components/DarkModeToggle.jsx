// src/components/DarkModeToggle.jsx
import React from "react";
import { useTheme } from "../context/ThemeContext";

const DarkModeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <div className="flex items-center">
      <label className="flex items-center cursor-pointer">
        <span className={`mr-2 font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          Dark Mode
        </span>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={darkMode}
            onChange={toggleTheme}
          />
          <div
            className={`block w-10 h-6 rounded-full transition-all duration-500 ${
              darkMode
                ? "bg-gradient-to-r from-red-700 to-[#800000] shadow-[0_0_14px_#800000]"
                : "bg-gray-600 shadow-inner"
            }`}
          ></div>
          <div
            className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform duration-500 ${
              darkMode
                ? "translate-x-4 bg-gray-300 shadow-[0_0_12px_#800000]"
                : "translate-x-1 bg-gray-600"
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default DarkModeToggle;
