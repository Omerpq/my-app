// src/Components/DeliveryManagement.jsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const DeliveryConfirmation = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const baseUrl = process.env.VITE_BACKEND_URL;

  // Search & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("dispatch_date");
  const [sortOrder, setSortOrder] = useState("asc");

  // Helper: format a timestamp or return "-" if null
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleString();
  };

  // Transform fetched data so that confirmation flags are derived from DB columns
  const transformData = (data) => {
    return data.map((item) => ({
      ...item,
      driverConfirmed: !!item.driver_confirmation,
      siteWorkerConfirmed: !!item.site_worker_confirmation,
    }));
  };

  useEffect(() => {
    if (!user) return;
    const endpoint =
      user.role.toLowerCase() === "driver"
        ? `${baseUrl}/api/dispatches/driver/${user.id}`
        : `${baseUrl}/api/dispatches/delivery`;
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => setItems(transformData(data)))
      .catch((err) => console.error("Error fetching deliveries:", err));
  }, [baseUrl, user]);

  // Updated handleConfirm function to use the POST /api/delivery/confirm endpoint.
  const handleConfirm = async (id, role) => {
    if (!window.confirm(`Are you sure you want to confirm delivery as ${role}?`))
      return;
    const confirmationTime = new Date().toISOString();
    const payload = { id, role, confirmationTime };
    try {
      const res = await fetch(`${baseUrl}/api/delivery/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error("Failed to update DB:", res.status, res.statusText);
        const errorData = await res.json();
        console.error("Error details:", errorData);
        return;
      }
      const updatedData = await res.json();
      console.log("DB updated successfully:", updatedData);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? role.toLowerCase() === "driver"
              ? {
                  ...item,
                  driver_confirmation: confirmationTime,
                  driverConfirmed: true,
                }
              : {
                  ...item,
                  site_worker_confirmation: confirmationTime,
                  siteWorkerConfirmed: true,
                }
            : item
        )
      );
    } catch (error) {
      console.error("Error confirming delivery:", error);
    }
  };

  // Filter data based on search term
  const filteredItems = items.filter((item) => {
    const itemField = `${item.items_dispatched} - ${item.itemName}`.toLowerCase();
    const deliveryLoc = (item.delivery_location || "").toLowerCase();
    const qty = item.dispatched_qty ? item.dispatched_qty.toString() : "";
    const term = searchTerm.toLowerCase();
    return itemField.includes(term) || deliveryLoc.includes(term) || qty.includes(term);
  });

  // Sorting logic.
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aVal, bVal;
    switch (sortField) {
      case "item":
        aVal = (a.items_dispatched + " - " + a.itemName).toLowerCase();
        bVal = (b.items_dispatched + " - " + b.itemName).toLowerCase();
        break;
      case "delivery_location":
        aVal = (a.delivery_location || "").toLowerCase();
        bVal = (b.delivery_location || "").toLowerCase();
        break;
      case "dispatch_date":
        aVal = new Date(a.dispatch_date);
        bVal = new Date(b.dispatch_date);
        break;
      case "dispatched_qty":
        aVal = a.dispatched_qty;
        bVal = b.dispatched_qty;
        break;
      case "driver_confirmation":
        aVal = a.driver_confirmation ? new Date(a.driver_confirmation) : new Date(0);
        bVal = b.driver_confirmation ? new Date(b.driver_confirmation) : new Date(0);
        break;
      case "site_worker_confirmation":
        aVal = a.site_worker_confirmation ? new Date(a.site_worker_confirmation) : new Date(0);
        bVal = b.site_worker_confirmation ? new Date(b.site_worker_confirmation) : new Date(0);
        break;
      default:
        aVal = a[sortField] || "";
        bVal = b[sortField] || "";
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field, smallMargin = true) => {
    const marginClass = smallMargin ? "ml-0.5" : "ml-1";
    if (sortField === field) {
      return sortOrder === "asc" ? (
        <span className={`font-bold ${marginClass} ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
          ↑
        </span>
      ) : (
        <span className={`font-bold ${marginClass} ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
          ↓
        </span>
      );
    }
    return <span className={`${marginClass} ${darkMode ? "text-blue-400" : "text-blue-500"}`}>↕</span>;
  };

  return (
    <div
      className={`max-w-7xl mx-auto p-8 rounded-xl transition-all duration-500 transform ${
        darkMode
          ? "bg-gray-800 text-white shadow-lg border border-gray-700"
          : "bg-white text-gray-900 shadow-2xl border border-gray-200"
      }`}
      style={{ overflowX: "hidden" }}
    >
      <h1 className="text-3xl font-bold text-center mb-6">Delivery Confirmation</h1>

      {/* Search Field */}
      <div className="mb-4 flex items-center">
        <label className="text-xs font-medium uppercase tracking-wider mr-2">SEARCH:</label>
        <input
          type="text"
          placeholder="Search by Item, Location, or Quantity..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-48 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
            darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
          }`}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
            <tr>
              <th onClick={() => handleSort("item")} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer">
                <div className="flex items-center">
                  Item {getSortIcon("item")}
                </div>
              </th>
              <th onClick={() => handleSort("delivery_location")} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer">
                <div className="flex items-center">
                  Delivery Location {getSortIcon("delivery_location")}
                </div>
              </th>
              <th onClick={() => handleSort("dispatched_qty")} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer">
                <div className="flex items-center">
                  Quantity {getSortIcon("dispatched_qty")}
                </div>
              </th>
              <th onClick={() => handleSort("dispatch_date")} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer">
                <div className="flex items-center">
                  Dispatch Time {getSortIcon("dispatch_date")}
                </div>
              </th>
              {/* DRIVER CONFIRMATION COLUMN */}
              <th onClick={() => handleSort("driver_confirmation")} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer">
                <div className="flex items-center">
                  Driver Confirmation {getSortIcon("driver_confirmation")}
                </div>
              </th>
              {/* SITE WORKER CONFIRMATION COLUMN */}
              <th onClick={() => handleSort("site_worker_confirmation")} className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer">
                <div className="flex items-center">
                  Site Worker Confirmation {getSortIcon("site_worker_confirmation")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedItems.map((item) => (
              <tr key={item.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2 whitespace-normal break-words">
                  {item.items_dispatched} - {item.itemName}
                </td>
                <td className="px-4 py-2 whitespace-normal break-words">{item.delivery_location || "-"}</td>
                <td className="px-4 py-2 whitespace-normal break-words">{item.dispatched_qty}</td>
                <td className="px-4 py-2 whitespace-normal break-words">{formatDate(item.dispatch_date)}</td>
                {/* DRIVER CONFIRMATION COLUMN */}
                <td className="px-4 py-2 whitespace-normal break-words">
                  {item.driverConfirmed ? (
                    <span className="text-orange-500">
                      <b>Confirmed by Driver</b> @ {formatDate(item.driver_confirmation)}
                    </span>
                  ) : (user?.role.toLowerCase() === "administrator" || user?.role.toLowerCase() === "driver") ? (
                    <button
                      onClick={() => handleConfirm(item.id, "Driver")}
                      className="w-24 h-10 flex items-center justify-center rounded bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 focus:outline-none"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button disabled className="w-24 h-10 flex items-center justify-center rounded bg-gray-400 text-white cursor-not-allowed">
                      Pending
                    </button>
                  )}
                </td>
                {/* SITE WORKER CONFIRMATION COLUMN */}
                <td className="px-4 py-2 whitespace-normal break-words">
                  {user?.role.toLowerCase() === "driver" ? (
                    item.siteWorkerConfirmed ? (
                      <span className="text-green-500" style={{ textShadow: "0 0 8px rgba(34,197,94,0.8)" }}>
                        <b>Delivered</b> @ {formatDate(item.site_worker_confirmation)}
                      </span>
                    ) : (
                      <span className="text-red-500">Confirmation Awaited</span>
                    )
                  ) : (user?.role.toLowerCase() === "siteworker" || user?.role.toLowerCase() === "administrator") ? (
                    !item.driverConfirmed ? (
                      <span className="text-red-500">Awaiting Driver Confirmation</span>
                    ) : item.siteWorkerConfirmed ? (
                      <span className="text-green-500" style={{ textShadow: "0 0 8px rgba(34,197,94,0.8)" }}>
                        <b>Delivered</b> @ {formatDate(item.site_worker_confirmation)}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirm(item.id, "SiteWorker")}
                        className="w-24 h-10 flex items-center justify-center rounded bg-gradient-to-r from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 focus:outline-none"
                      >
                        Confirm
                      </button>
                    )
                  ) : (
                    <button disabled className="w-24 h-10 flex items-center justify-center rounded bg-gray-400 text-white cursor-not-allowed">
                      Pending
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryConfirmation;
