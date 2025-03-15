// src/LogoutButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Navigate back to the login page
    navigate("/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
    >
      Logout
    </button>
  );
}