// src/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// A simple check to see if a token exists (you can add more logic later)
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

export default function ProtectedRoute() {
  // If authenticated, render the child routes; otherwise, redirect to login
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
}
