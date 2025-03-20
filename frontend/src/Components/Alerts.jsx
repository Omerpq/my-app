// src/Components/Alerts.jsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const Alerts = () => {
  const { darkMode } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [settledFilter, setSettledFilter] = useState("all"); // "all", "settled", or "notSettled"
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const baseUrl = process.env.VITE_BACKEND_URL || "https://my-app-1-uzea.onrender.com";
  useEffect(() => {
    fetch(`${baseUrl}/api/alerts`)
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch((err) => console.error("Error fetching alerts:", err));
  }, [baseUrl]);

  // Filter alerts based on search and settled status
  const filteredAlerts = alerts.filter((alert) => {
    const term = searchTerm.toLowerCase();
    const searchCondition =
      alert.type.toLowerCase().includes(term) ||
      alert.message.toLowerCase().includes(term) ||
      new Date(alert.date).toLocaleString().toLowerCase().includes(term) ||
      (alert.settled_time &&
        new Date(alert.settled_time).toLocaleString().toLowerCase().includes(term));

    const filterCondition =
      settledFilter === "all" ||
      (settledFilter === "settled" && alert.settled) ||
      (settledFilter === "notSettled" && !alert.settled);

    return searchCondition && filterCondition;
  });

  // Sort alerts based on sortColumn and sortDirection
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (!sortColumn) return 0;
    let aValue, bValue;
    if (sortColumn === "type") {
      aValue = a.type.toLowerCase();
      bValue = b.type.toLowerCase();
    } else if (sortColumn === "message") {
      aValue = a.message.toLowerCase();
      bValue = b.message.toLowerCase();
    } else if (sortColumn === "date") {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    }
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Handle sorting when clicking on headers
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Get sort icon (consistent with StockView.jsx)
  const getSortIcon = (field) => {
    if (sortColumn === field) {
      return sortDirection === "asc" ? (
        <span className={`ml-1 font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>↑</span>
      ) : (
        <span className={`ml-1 font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>↓</span>
      );
    }
    return <span className={`ml-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>↕</span>;
  };

  // Render the Settled status: green tick if true, red cross if false.
  const renderSettledStatus = (alert) => {
    return alert.settled ? (
      <span className="text-green-500 font-bold">✔</span>
    ) : (
      <span className="text-red-500 font-bold">✖</span>
    );
  };

  return (
    <div
      className={`max-w-7xl mx-auto p-8 rounded-xl transition-all duration-500 transform ${
        darkMode
          ? "bg-gray-800 text-white shadow-lg border border-gray-700"
          : "bg-white text-gray-900 shadow-2xl border border-gray-200"
      }`}
    >
      <h1 className="text-3xl font-bold text-center mb-6">Alerts</h1>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <label className="text-xs font-medium uppercase tracking-wider mr-2">
            Search:
          </label>
          <input
            type="text"
            placeholder="Search by type, message, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-48 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          />
        </div>
        {/* Button group for filtering by settled status */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSettledFilter("all")}
            className={`px-3 py-1 text-xs rounded transition-colors duration-300 ${
              settledFilter === "all"
                ? "bg-blue-500 text-white ring-2 ring-offset-2"
                : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
            }`}
          >
            All Alerts
          </button>
          <button
            onClick={() => setSettledFilter("settled")}
            className={`px-3 py-1 text-xs rounded transition-colors duration-300 ${
              settledFilter === "settled"
                ? "bg-green-500 text-white ring-2 ring-offset-2"
                : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
            }`}
          >
            Settled
          </button>
          <button
            onClick={() => setSettledFilter("notSettled")}
            className={`px-3 py-1 text-xs rounded transition-colors duration-300 ${
              settledFilter === "notSettled"
                ? "bg-red-500 text-white ring-2 ring-offset-2"
                : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
            }`}
          >
            Not Settled
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
            <tr>
              <th
                onClick={() => handleSort("type")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Type{getSortIcon("type")}
              </th>
              <th
                onClick={() => handleSort("message")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Message{getSortIcon("message")}
              </th>
              <th
                onClick={() => handleSort("date")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Generated At{getSortIcon("date")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Settled
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Settled Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedAlerts.length > 0 ? (
              sortedAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="px-4 py-3 text-xs">{alert.type}</td>
                  <td className="px-4 py-3 text-xs">{alert.message}</td>
                  <td className="px-4 py-3 text-xs">
                    {new Date(alert.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs">{renderSettledStatus(alert)}</td>
                  <td className="px-4 py-3 text-xs">
                    {alert.settled_time
                      ? new Date(alert.settled_time).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-3 text-center text-xs">
                  No alerts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alerts;
