// src/GlobalNavigation.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  FaTachometerAlt,
  FaUser,
  FaBoxes,
  FaCog,
  FaChartPie,
  FaCalendarAlt,
  FaBell,
  FaEnvelope,
} from "react-icons/fa";

const navItems = [
  { name: "Dashboard", icon: <FaTachometerAlt className="text-indigo-500" />, route: "/dashboard" },
  { name: "User Management", icon: <FaUser className="text-green-500" />, route: "/users" },
  { name: "Inventory Management", icon: <FaBoxes className="text-yellow-500" />, route: "/inventory" },
  { name: "Settings", icon: <FaCog className="text-red-500" />, route: "/settings" },
  { name: "Analytics", icon: <FaChartPie className="text-purple-500" />, route: "/analytics" },
  { name: "Calendar", icon: <FaCalendarAlt className="text-blue-500" />, route: "/calendar" },
  { name: "Notifications", icon: <FaBell className="text-pink-500" />, route: "/notifications" },
  { name: "Messages", icon: <FaEnvelope className="text-teal-500" />, route: "/messages" },
];

const HamburgerIcon = () => (
  <div className="flex flex-col items-center justify-center space-y-1">
    <span className="block w-5 h-0.5 bg-current"></span>
    <span className="block w-5 h-0.5 bg-current"></span>
    <span className="block w-5 h-0.5 bg-current"></span>
  </div>
);

const GlobalNavigation = () => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`h-screen fixed top-0 left-0 z-50 transition-all duration-200 
        ${isOpen ? "w-64 p-4" : "w-16 p-2"} 
        ${darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 bg-opacity-80" : "bg-white shadow-md"} 
        backdrop-blur-xl 
        ${
          isOpen
            ? darkMode
              ? "border-r border-white/30"
              : "border-r border-gray-200"
            : darkMode
              ? "border-r-0 shadow-[0_0_10px_#3b82f6]"
              : "border-r-0 shadow-[0_0_15px_#3b82f6]"
        } 
        md:relative`}
    >
      <div className={`flex items-center ${isOpen ? "justify-between" : "justify-center"} mb-6`}>
        {isOpen && (
          <span
            className={`font-bold text-xl tracking-wide drop-shadow-lg ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            MyApp
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`focus:outline-none ${darkMode ? "text-white" : "text-gray-900"} hover:scale-110 transition-transform duration-200`}
        >
          <HamburgerIcon />
        </button>
      </div>
      <nav>
        <ul>
          {navItems.map((item, index) => (
            <li key={index} className="mb-2">
              <NavLink
                to={item.route}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-md transition-all duration-200 
                  ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-200"} 
                  hover:backdrop-blur-sm transform hover:scale-105 
                  ${isActive ? (darkMode ? "bg-white/20" : "bg-gray-300") : ""} ${!isOpen ? "justify-center" : ""}`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {isOpen && (
                  <span className={`ml-4 text-sm font-medium tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {item.name}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default GlobalNavigation;
