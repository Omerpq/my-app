// src/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import GlobalNavigation from "./Components/GlobalNavigation";
import TopNavbar from "./Components/TopNavbar"; 
import { useTheme } from "./context/ThemeContext";

const Layout = () => {
  const { darkMode } = useTheme();

  return (
    <div
      className={`
        min-h-screen w-full
        flex flex-col md:flex-row
        ${darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"}
      `}
      style={{
        overflowX: "hidden", // hides any minor horizontal overflow
      }}
    >
      {/* Top Navbar (visible only on small screens if you want) */}
      <div className="md:hidden">
        <TopNavbar />
      </div>

      {/* Sidebar (visible on md+ screens) */}
      <div className="hidden md:block">
        <GlobalNavigation />
      </div>

      {/* Main content area */}
      <div className="flex-1 p-4 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
