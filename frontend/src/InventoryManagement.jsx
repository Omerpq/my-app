// src/InventoryManagement.jsx
import React, { useState, useEffect } from "react";
import { useTheme, ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

import DarkModeToggle from "./components/DarkModeToggle";
import StockView from "./components/StockView";
import StockEntry from "./components/StockEntry";
import RequestStock from "./components/RequestStock";
import StockRequests from "./components/StockRequests";
import DispatchManagement from "./components/DispatchManagement";
import DeliveryConfirmation from "./components/DeliveryConfirmation";
import Alerts from "./components/Alerts";
import Reports from "./components/Reports";
import AnimatedRedLightBadge from "./components/AnimatedRedLightBadge";
import AnimatedBlueBadge from "./components/AnimatedBlueBadge";
import AnimatedGreenBadge from "./components/AnimatedGreenBadge";
import ErrorBoundary from "./components/ErrorBoundary";
import PickupRequests from "./components/PickupRequests";

// -------------------------
// Sort Arrow
// -------------------------
const SortArrow = ({ direction }) =>
  direction === "asc" ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 15 12 9 18 15" />
      <line x1="6" y1="18" x2="18" y2="18" />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
      <line x1="6" y1="6" x2="18" y2="6" />
    </svg>
  );

// -------------------------
// ReportCard (unchanged)
// -------------------------
const ReportCard = ({ title, headers, data, keys }) => {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOpt, setSortOpt] = useState(keys[0]);
  const [sortDir, setSortDir] = useState("asc");

  const toggleSort = () => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));

  const filtered = data.filter((row) =>
    keys.some((key) => String(row[key]).toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortOpt] ?? "";
    let bv = b[sortOpt] ?? "";
    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "asc" ? av - bv : bv - av;
    }
    av = av.toString().toLowerCase();
    bv = bv.toString().toLowerCase();
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div
      className={`p-6 rounded-xl border transition-shadow duration-300 ${
        darkMode
          ? "bg-gray-800 border-gray-700 hover:shadow-xl"
          : "bg-white border-gray-300 hover:shadow-xl"
      }`}
    >
      <h2 className="text-2xl font-semibold mb-3 border-b pb-2">{title}</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full sm:w-48 px-4 py-1 mb-2 sm:mb-0 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
            darkMode
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-white text-gray-900 border-gray-300 shadow-inner"
          } focus:border-blue-500`}
        />
        <div className="flex items-center">
          <select
            value={sortOpt}
            onChange={(e) => setSortOpt(e.target.value)}
            className={`px-4 py-1 border rounded-lg focus:outline-none transition-all duration-500 w-32 ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300 shadow-inner"
            } focus:border-blue-500`}
          >
            {headers.map((h, i) => (
              <option key={i} value={keys[i]}>
                {h}
              </option>
            ))}
          </select>
          <button
            onClick={toggleSort}
            className="px-2 py-1 focus:outline-none"
            title="Toggle sort direction"
          >
            <SortArrow direction={sortDir} />
          </button>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {headers.map((h, i) => (
              <th key={i} className="py-2 px-3 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id} className="border-b">
              {keys.map((k, i) => (
                <td key={i} className="py-2 px-3">
                  {row[k]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// -------------------------
// InventoryManagement
// -------------------------
const InventoryManagement = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Guard if user is not present
  if (!user) return <Navigate to="/login" replace />;

  // Default tab
  const [activeTab, setActiveTab] = useState(
    user.role.toLowerCase() === "driver" ? "delivery" : "stockView"
  );

  // Tabs
  const tabs = [
    { key: "stockView", label: "Stock View" },
    { key: "stockEntry", label: "Stock Entry" },
    { key: "requestStock", label: "Create Request" },
    { key: "stockRequests", label: "Stock Requests" },
    { key: "pickupRequests", label: "Pick-up Requests" },
    { key: "dispatch", label: "Dispatch" },
    { key: "delivery", label: "Delivery" },
    { key: "alerts", label: "Alerts" },
    { key: "reports", label: "Reports" },
  ];

  const inventoryTabPermissions = {
    stockView: "canViewStock",
    stockEntry: "canAddStockEntry",
    requestStock: "canRequestStock",
    stockRequests: "canViewStockRequests",
    pickupRequests: "canViewPickupRequests",
    dispatch: "canDispatchStock",
    delivery: "canConfirmDelivery",
    alerts: "canViewAlerts",
    reports: "canViewReports",
  };

  // Filter tabs
  let availableTabs = tabs;
  if (user.role !== "Administrator") {
    availableTabs = availableTabs.filter((tab) => {
      const reqPerm = inventoryTabPermissions[tab.key];
      return reqPerm && user.permissions?.includes(reqPerm);
    });
  }
  if (user.role !== "Administrator" && !user.permissions?.includes("canAccessInventoryManagement")) {
    availableTabs = [];
  }

  // -----------------------------
  // Blue Badge: Stock Requests
  // -----------------------------
  const [newCount, setNewCount] = useState(0);

  // (CHANGED) function to refetch stock requests count
  const refetchStockCount = () => {
    if (!user) return;
    if (user.role.toLowerCase() === "driver") {
      fetch(`${baseUrl}/api/request_stock`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const pending = data.filter((r) => {
            // Only "stock" requests with "Pending" approval
            return (
              r.request_type?.toLowerCase() === "stock" &&
              (r.approval_status || "").toLowerCase() === "pending"
            );
          }).length;
          setNewCount(pending);
        })
        .catch((err) => console.error("Error fetching stock requests for driver:", err));
    } else {
      fetch(`${baseUrl}/api/request_stock`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (user.role === "SiteWorker") {
            // For siteWorker, let's filter only "stock" requests they made that are still "Pending"
            const count = data.filter((r) => {
              return (
                r.request_type?.toLowerCase() === "stock" &&
                r.requestor_email === user.email &&
                (r.approval_status || "").toLowerCase() === "pending"
              );
            }).length;
            setNewCount(count);
          } else {
            // For Manager/Admin/InventoryManager, show all "stock" pending
            const pending = data.filter((r) => {
              return (
                r.request_type?.toLowerCase() === "stock" &&
                (r.approval_status || "").toLowerCase() === "pending"
              );
            }).length;
            setNewCount(pending);
          }
        })
        .catch((err) => console.error("Error fetching stock requests:", err));
    }
  };

  // Run once on mount + re-run if user/activeTab changes
  useEffect(() => {
    refetchStockCount();
  }, [baseUrl, user, activeTab]);

  // If siteWorker is on "stockRequests" tab, remove the blue badge
  useEffect(() => {
    if (activeTab === "stockRequests" && user.role === "SiteWorker") {
      setNewCount(0);
    }
  }, [activeTab, user]);

  // -----------------------------
  // Green Badge: Pickup Requests
  // -----------------------------
  const [newPickupCount, setNewPickupCount] = useState(0);

  // (CHANGED) function to refetch pickup requests count
  const refetchPickupCount = () => {
    if (!user) return;
    fetch(`${baseUrl}/api/request_stock`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // For pickup: we consider "status" = "Pending"
        const pickups = data.filter((r) => r.request_type?.toLowerCase() === "pickup");
        const pendingPickups = pickups.filter((r) => (r.status || "").toLowerCase() === "pending");
        setNewPickupCount(pendingPickups.length);
      })
      .catch((err) => console.error("Error fetching pickup requests:", err));
  };

  // Run once on mount + re-run if user changes
  useEffect(() => {
    refetchPickupCount();
  }, [baseUrl, user]);

  // -----------------------------
  // Alerts Badge
  // -----------------------------
  const [newAlertsCount, setNewAlertsCount] = useState(0);
  useEffect(() => {
    if (activeTab === "alerts") {
      setNewAlertsCount(0);
    } else {
      fetch(`${baseUrl}/api/alerts`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          const unsettled = data.filter((alert) => alert.settled === false);
          setNewAlertsCount(unsettled.length);
        })
        .catch((err) => console.error("Error fetching alerts:", err));
    }
  }, [activeTab, baseUrl]);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <header
        className={`flex justify-between items-center p-6 shadow-lg ${
          darkMode
            ? "bg-gray-800 text-white border border-gray-700"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <div className="text-xl font-semibold">Inventory Management</div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className={`text-sm ${darkMode ? "text-yellow-600" : "text-gray-500"}`}>
              {user.role}
            </span>
            <span className="text-xs">{user.name}</span>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      <nav className="p-6">
        <div className="flex flex-wrap gap-4 relative">
          {availableTabs.map((tab) => {
            let btnClass =
              "py-2 px-4 rounded-lg transition-all duration-500 shadow-md focus:outline-none relative ";
            if (tab.key === "alerts") {
              btnClass += "bg-[#ff9933] text-white hover:bg-[#ff7700]";
            } else {
              btnClass +=
                activeTab === tab.key
                  ? "bg-green-500 text-white"
                  : darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-900";
            }
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={btnClass}>
                {tab.label}
                {tab.key === "alerts" && newAlertsCount > 0 && <AnimatedRedLightBadge />}
                {tab.key === "stockRequests" && newCount > 0 && <AnimatedBlueBadge />}
                {tab.key === "pickupRequests" && newPickupCount > 0 && <AnimatedGreenBadge />}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="p-6 transition-all duration-500">
        {activeTab === "stockView" &&
          (user.role === "Administrator" || user.permissions?.includes("canViewStock")) && <StockView />}

        {activeTab === "stockEntry" &&
          (user.role === "Administrator" || user.permissions?.includes("canAddStockEntry")) && (
            <ErrorBoundary>
              <StockEntry />
            </ErrorBoundary>
          )}

        {activeTab === "requestStock" &&
          (user.role === "Administrator" || user.permissions?.includes("canRequestStock")) && (
            <RequestStock
              // (CHANGED) pass the two callbacks so new requests update badges immediately
              onNewStockRequest={refetchStockCount}
              onNewPickupRequest={refetchPickupCount}
            />
          )}

        {activeTab === "stockRequests" &&
          (user.role === "Administrator" || user.permissions?.includes("canViewStockRequests")) && (
            <StockRequests
              // If you want immediate disappearance of the badge when Approve/Reject is clicked,
              // you can pass a callback here as well, e.g. onStockRequestsUpdated={refetchStockCount}
            />
          )}

        {activeTab === "pickupRequests" &&
          (user.role === "Administrator" || user.permissions?.includes("canViewPickupRequests")) && (
            <PickupRequests
              onMarkSeen={() => {
                // (CHANGED) immediately decrement & re-fetch to ensure correct count
                setNewPickupCount((prev) => Math.max(prev - 1, 0));
                refetchPickupCount();
              }}
            />
          )}

        {activeTab === "dispatch" &&
          (user.role === "Administrator" || user.permissions?.includes("canDispatchStock")) && <DispatchManagement />}

        {activeTab === "delivery" &&
          (user.role === "Administrator" || user.permissions?.includes("canConfirmDelivery")) && (
            <DeliveryConfirmation />
          )}

        {activeTab === "alerts" &&
          (user.role === "Administrator" || user.permissions?.includes("canViewAlerts")) && (
            <Alerts dumyAlerts={[]} />
          )}

        {activeTab === "reports" &&
          (user.role === "Administrator" || user.permissions?.includes("canViewReports")) && <Reports />}
      </main>
    </div>
  );
};

export default InventoryManagement;
