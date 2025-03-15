import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import UserManagement from "./UserManagement";
import InventoryManagement from "./InventoryManagement";
import Login from "./Login";
import ViewProjects from "./Components/ViewProjects";
import BTForm from "./Components/BTForm";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Wrap these routes with Layout (which has <Outlet />) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/inventory" element={<InventoryManagement />} />

          {/* New route for Settings */}
          <Route path="/settings" element={<BTForm />} />

          {/* Projects route container with its own <Outlet /> */}
          <Route path="/projects" element={<Outlet />}>
            {/* /projects -> shows ViewProjects */}
            <Route index element={<ViewProjects />} />
            {/* /projects/:projectId/bt-form -> shows BTForm */}
            <Route path=":projectId/bt-form" element={<BTForm />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
