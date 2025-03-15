// src/Components/GlobalNavigation.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Added useNavigate here
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  FaTachometerAlt,
  FaUser,
  FaBoxes,
  FaCog,
  FaChartPie,
  FaCalendarAlt,
  FaBell,
  FaEnvelope,
  FaClipboardList,
  FaSignOutAlt, // <-- Import for Logout icon
} from "react-icons/fa";

const navItems = [
  { name: "Dashboard", icon: <FaTachometerAlt className="text-indigo-500" />, route: "/dashboard" },
  { name: "User Management", icon: <FaUser className="text-green-500" />, route: "/users" },
  { name: "Inventory Management", icon: <FaBoxes className="text-yellow-500" />, route: "/inventory" },
  { name: "Project Management", icon: <FaClipboardList className="text-blue-500" />, route: "/projects" },
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
  const { user: currentUser, logout } = useAuth(); // Access logout from your Auth context
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate(); // Initialize navigate

  // Filter out "User Management" and "Project Management" if not an Administrator
  const filteredNavItems = navItems.filter((item) => {
    if (item.name === "User Management" || item.name === "Project Management") {
      return currentUser?.role === "Administrator";
    }
    return true;
  });

  // Minimal change: wrap logout with a redirect so that it logs out completely (including on Dashboard)
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={`
        flex flex-col transition-all duration-200
        ${isOpen ? "w-64 p-4" : "w-16 p-2"}
        ${darkMode ? "bg-gradient-to-br from-gray-800 to-gray-900 bg-opacity-80" : "bg-white shadow-md"}
        backdrop-blur-xl
        ${isOpen ? (darkMode ? "border-r border-white/30" : "border-r border-gray-200") : (darkMode ? "border-r-0 shadow-[0_0_10px_#3b82f6]" : "border-r-0 shadow-[0_0_15px_#3b82f6]")}
      `}
    >
      {/* Top area with brand + hamburger */}
      <div className={`flex items-center ${isOpen ? "justify-between" : "justify-center"} mb-6`}>
        {isOpen && (
          <span
            className={`
              font- text-md tracking-wide drop-shadow-lg
              bg-gradient-to-r from-orange-600 to-yellow-300 text-transparent bg-clip-text
            `}
          >
            FieldOps
          </span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`focus:outline-none ${darkMode ? "text-white" : "text-gray-900"} hover:scale-110 transition-transform duration-200`}
        >
          <HamburgerIcon />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1">
        <ul>
          {filteredNavItems.map((item, index) => (
            <li key={index} className="mb-2">
              <NavLink
                to={item.route}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-md transition-all duration-200
                  ${darkMode ? "hover:bg-white/10" : "hover:bg-gray-200"}
                  hover:backdrop-blur-sm transform hover:scale-105
                  ${isActive ? (darkMode ? "bg-white/20" : "bg-gray-300") : ""}
                  ${!isOpen ? "justify-center" : ""}`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {isOpen && (
                  <span
                    className={`ml-4 text-sm font-medium tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {item.name}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout at bottom */}
      <div className="mt-auto pt-4 border-t border-gray-600">
        <button
          onClick={handleLogout}  // Changed from onClick={logout} to handleLogout
          className={`
            flex items-center p-3 rounded-md transition-all duration-200
            ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-gray-200 text-gray-900"}
            hover:backdrop-blur-sm transform hover:scale-105 w-full
            ${!isOpen ? "justify-center" : ""}
          `}
        >
          <FaSignOutAlt className="text-lg text-red-500 shadow-[0_0_8px_#ff0000]" />
          {isOpen && (
            <span
              className={`ml-4 text-sm font-medium tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default GlobalNavigation;
