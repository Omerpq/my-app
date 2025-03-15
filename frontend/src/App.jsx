// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import UserManagement from "./UserManagement";
import InventoryManagement from "./InventoryManagement";
import ProjectManagement from "./ProjectManagement";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./Layout";
import { LanguageProvider } from "./context/LanguageContext";
import FormSelection from "./Components/FormSelection";
import DynamicForm from "./Components/DynamicForm";

// Existing form components
import BTForm from "./Components/BTForm";
import QuotationForm from "./Components/QuotationForm";
import KeyHandoverForm from "./Components/KeyHandoverForm";

// Project-related components
import ViewProjects from "./Components/ViewProjects";
import CreateProject from "./Components/CreateProject";

// Existing ProjectSummary component
import ProjectSummary from "./Components/ProjectSummary";

// Splash screen component
import SplashScreen from "./Components/SplashScreen";

// --- LandingRedirect Component ---
// This component checks the logged-in user’s permissions and redirects accordingly.
const LandingRedirect = () => {
  // Here we assume the ProtectedRoute (or Layout) already ensured that "user" is available.
  // In a real app you might use a custom hook (e.g. useAuth) to get the current user.
  // For simplicity, we assume the user object is stored in localStorage via your auth flow.
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) return <Navigate to="/login" replace />;

  const permissionRoutes = [
    { perm: "canAccessDashboard", route: "/dashboard" },
    { perm: "canAccessUserManagement", route: "/users" },
    { perm: "canAccessInventoryManagement", route: "/inventory" },
    { perm: "canAccessProjectManagement", route: "/projects" }
  ];

  const firstAllowedRoute = permissionRoutes.find(p => user.permissions?.includes(p.perm));

  return firstAllowedRoute ? <Navigate to={firstAllowedRoute.route} replace /> : <Navigate to="/login" replace />;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          {/* Instead of redirecting "/" to login immediately, we use LandingRedirect */}
          <Route path="/" element={<LandingRedirect />} />
          <Route
            path="/login"
            element={
              <>
                <Login />
                {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
              </>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* The LandingRedirect now handles "/" */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/settings" element={<BTForm />} />
              <Route path="/projects" element={<ProjectManagement />}>
                <Route index element={<ViewProjects />} />
                <Route path="create" element={<CreateProject />} />
              </Route>
              <Route path="/projects/:projectId/forms/bt-form" element={<BTForm />} />
              <Route path="/projects/:projectId/forms/quotation-form" element={<QuotationForm />} />
              <Route path="/projects/:projectId/forms/key-handover-form" element={<KeyHandoverForm />} />
              <Route path="/projects/:projectId/forms" element={<FormSelection />} />
              <Route path="/projects/:projectId/forms/:formId" element={<DynamicForm />} />
              <Route path="/projects/:projectId/summary" element={<ProjectSummary />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;
