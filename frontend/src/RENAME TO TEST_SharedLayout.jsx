// src/components/SharedLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import GlobalNavigation from "./GlobalNavigation";

const SharedLayout = () => {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <GlobalNavigation />
      </aside>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default SharedLayout;
