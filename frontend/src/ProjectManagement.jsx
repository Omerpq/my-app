// src/ProjectManagement.jsx
import React, { useState } from "react";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import DarkModeToggle from "./components/DarkModeToggle";

const ProjectManagement = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [subView, setSubView] = useState("view"); // "view" or "create"

  if (!user) return <Navigate to="/login" replace />;

  const getBtnClasses = (active) => {
    let base = "py-2 px-4 rounded-lg transition-all duration-500 shadow-md focus:outline-none relative";
    if (active) {
      base += " bg-green-500 text-white";
    } else {
      base += darkMode ? " bg-gray-700 text-white" : " bg-gray-200 text-gray-900";
    }
    return base;
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <header
        className={`flex justify-between items-center p-6 shadow-lg ${
          darkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <div className="text-xl font-semibold">Project Management</div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className={`text-sm ${darkMode ? "text-yellow-600" : "text-gray-500"}`}>{user.role}</span>
            <span className="text-xs">{user.name}</span>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      <nav className="p-6">
        <div className="flex flex-wrap gap-4 relative">
          {user.permissions.includes("canViewProjects") && (
            <button
              className={getBtnClasses(subView === "view")}
              onClick={() => {
                setSubView("view");
                navigate("/projects");
              }}
            >
              View Projects
            </button>
          )}
          {user.permissions.includes("canCreateProject") && (
            <button
              className={getBtnClasses(subView === "create")}
              onClick={() => {
                setSubView("create");
                navigate("/projects/create");
              }}
            >
              Create Project
            </button>
          )}
        </div>
      </nav>

      <main className="p-6 transition-all duration-500">
        {subView === "view" ? (
          user.permissions.includes("canViewProjects") ? (
            <Outlet />
          ) : (
            <div>You do not have permission to view projects.</div>
          )
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default ProjectManagement;
