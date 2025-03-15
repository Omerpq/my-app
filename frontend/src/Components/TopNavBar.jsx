// src/Components/TopNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiUsers, FiArchive, FiFolder, FiLogOut } from "react-icons/fi"; // <-- Added FiLogOut
import { useAuth } from "../context/AuthContext"; // <-- To access logout

const TopNavbar = () => {
  const { logout } = useAuth(); // <-- Grab the logout function

  return (
    <nav className="bg-gray-900 text-white flex justify-around py-3 shadow-lg">
      <Link to="/dashboard" className="flex flex-col items-center">
        <FiHome size={20} className="text-indigo-500" />
        <span className="text-xs">Dashboard</span>
      </Link>

      <Link to="/users" className="flex flex-col items-center">
        <FiUsers size={20} className="text-green-500" />
        <span className="text-xs">Users Mgt.</span>
      </Link>

      <Link to="/inventory" className="flex flex-col items-center">
        <FiArchive size={20} className="text-yellow-500" />
        <span className="text-xs">Inventory Mgt.</span>
      </Link>

      <Link to="/projects" className="flex flex-col items-center">
        <FiFolder size={20} className="text-blue-500" />
        <span className="text-xs">Projects Mgt.</span>
      </Link>

      {/* New Logout link */}
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault(); // Prevent navigation to "#"
          logout();          // Call your logout logic
        }}
        className="flex flex-col items-center"
      >
        <FiLogOut size={20} className="text-red-500" />
        <span className="text-xs">Logout</span>
      </Link>
    </nav>
  );
};

export default TopNavbar;
