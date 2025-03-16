// src/GlobalNavigation.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  FaChartPie,
  FaUser,
  FaBoxes,
  FaCog,
  FaUserShield,
  FaCalendarAlt,
  FaBell,
  FaEnvelope,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";

const navItems = [
  { name: "Business Analytics", icon: <FaChartPie className="text-red-500" />, route: "/analytics" },
  { name: "User Management", icon: <FaUser className="text-blue-500" />, route: "/users" },
  { name: "User Permissions", icon: <FaUserShield className="text-purple-500" />, route: "/user-permissions" },
  { name: "Inventory Management", icon: <FaBoxes className="text-green-500" />, route: "/inventory" },
  { name: "Project Management", icon: <FaClipboardList className="text-orange-500" />, route: "/projects" },
  { name: "Settings", icon: <FaCog className="text-teal-500" />, route: "/settings" },
  { name: "Calendar", icon: <FaCalendarAlt className="text-pink-500" />, route: "/calendar" },
  { name: "Notifications", icon: <FaBell className="text-yellow-500" />, route: "/notifications" },
  { name: "Messages", icon: <FaEnvelope className="text-indigo-500" />, route: "/messages" },
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
  const { user: currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  // Updated filtering: For administrators, always include Business Analytics and User Permissions.
  const filteredNavItems = navItems.filter((item) => {
    if (item.name === "Business Analytics") {
      if (currentUser && currentUser.role === "Administrator") return true;
      return currentUser && currentUser.permissions && currentUser.permissions.includes("canAccessDashboard");
    }
    if (item.name === "User Management") {
      return currentUser && currentUser.permissions && currentUser.permissions.includes("canAccessUserManagement");
    }
    if (item.name === "User Permissions") {
      // Admins always have all permissions by default.
      return currentUser && currentUser.role === "Administrator";
    }
    if (item.name === "Project Management") {
      return currentUser && currentUser.permissions && currentUser.permissions.includes("canAccessProjectManagement");
    }
    if (item.name === "Inventory Management") {
      return currentUser && currentUser.permissions && currentUser.permissions.includes("canAccessInventoryManagement");
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-screen flex">
      <div className="absolute top-[-5rem] left-[-15rem] w-[25rem] h-[20rem] bg-gradient-to-r from-green-400 to-blue-900 rounded-full blur-3xl opacity-30 z-0" />
      <div className="absolute bottom-[-5rem] right-[-5rem] w-[25rem] h-[20rem] bg-gradient-to-r from-green-800 to-blue-800 rounded-full blur-3xl opacity-30 z-0" />

      <div
        className={`
          relative z-10
          flex flex-col transition-all duration-200
          ${isOpen ? "w-64 p-4" : "w-16 p-2"}
          bg-white/10 backdrop-blur-xl
          ${
            isOpen
              ? (darkMode ? "border-r border-white/30" : "border-r border-gray-200")
              : (darkMode ? "border-r-0 shadow-[0_0_10px_#3b82f6]" : "border-r-0 shadow-[0_0_15px_#3b82f6]")
          }
          rounded-xl m-4
        `}
      >
        <div className={`flex items-center ${isOpen ? "justify-between" : "justify-center"} mb-6 transition-all duration-200`}>
          {isOpen && (
            // --- Removed the text gradient classes. Replaced with a pill containing a glow. ---
            <span className="relative inline-block px-3 py-1 font-semibold text-white rounded-full overflow-hidden">
              {/* Actual text */}
              <span className="relative z-10">FieldOps</span>
              {/* Glow behind the pill */}
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-blue-500 opacity-70 blur-md animate-pulse" />
            </span>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              focus:outline-none
              ${darkMode ? "text-white" : "text-gray-900"}
              hover:scale-110 transition-transform duration-200
            `}
          >
            <HamburgerIcon />
          </button>
        </div>

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
                    <span className={`ml-4 text-sm font-medium tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {item.name}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-600">
          <button
            onClick={handleLogout}
            className={`
              flex items-center p-3 rounded-md transition-all duration-200
              ${darkMode ? "hover:bg-white/10 text-white" : "hover:bg-gray-200 text-gray-900"}
              hover:backdrop-blur-sm transform hover:scale-105 w-full
              ${!isOpen ? "justify-center" : ""}
            `}
          >
            <FaSignOutAlt className="text-lg text-red-500 shadow-[0_0_8px_#ff0000]" />
            {isOpen && (
              <span className={`ml-4 text-sm font-medium tracking-wide ${darkMode ? "text-white" : "text-gray-900"}`}>
                Logout
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalNavigation;
