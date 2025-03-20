// src/Components/PickupRequests.jsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const PickupRequests = ({ onMarkSeen }) => {  // Accept onMarkSeen prop
  const { darkMode } = useTheme();
  const { user } = useAuth();
  if (!user) return null;

  const [rows, setRows] = useState([]);
  const [processing, setProcessing] = useState(false);
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch only pickup requests
  useEffect(() => {
    const endpoint = `${baseUrl}/api/request_stock`;
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        // Filter only pickup requests (assuming request_type is "pickup")
        const pickupData = data.filter(
          (row) =>
            row.request_type &&
            row.request_type.toLowerCase() === "pickup"
        );
        setRows(pickupData);
      })
      .catch((err) =>
        console.error("Error fetching pickup requests:", err)
      );
  }, [baseUrl]);

  // Search, sort states (minimal implementation)
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredData = rows.filter((row) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const searchIn = `
      ${row.job_id}
      ${row.site_worker}
      ${row.delivery_location}
      ${row.pickup_datetime}
    `.toLowerCase();
    return searchIn.includes(term);
  });

  const sortedData = sortField
    ? [...filteredData].sort((a, b) => {
        let fieldA = a[sortField] ?? "";
        let fieldB = b[sortField] ?? "";
        if (typeof fieldA === "number" && typeof fieldB === "number") {
          return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
        }
        fieldA = fieldA.toString().toLowerCase();
        fieldB = fieldB.toString().toLowerCase();
        if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      })
    : filteredData;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === "asc" ? (
        <span className={`ml-1 font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
          ↑
        </span>
      ) : (
        <span className={`ml-1 font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
          ↓
        </span>
      );
    }
    return <span className={`ml-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>↕</span>;
  };

  // Handler for driver to mark a pickup request as seen.
  const handleMarkSeen = async (request) => {
    if (!window.confirm("Mark this pick-up request as seen by you?")) return;
    try {
      const res = await fetch(`${baseUrl}/api/request_stock/${request.id}/mark-seen`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driver_seen_time: new Date().toISOString() }),
      });
      if (res.ok) {
        setRows((prevRows) =>
          prevRows.map((r) =>
            r.id === request.id ? { ...r, status: "Seen by Driver" } : r
          )
        );
        if (typeof onMarkSeen === "function") {
          onMarkSeen();
        }
      }
    } catch (error) {
      console.error("Error marking pickup request as seen:", error);
    }
  };

  return (
    <div
      className={`w-full p-8 rounded-xl transition-all duration-500 transform ${
        darkMode
          ? "bg-gray-800 text-white shadow-lg border border-gray-700"
          : "bg-white text-gray-900 shadow-2xl border border-gray-200"
      }`}
      style={{ overflowX: "hidden" }}
    >
      <h1 className="text-3xl font-bold text-center mb-6">Pick-up Requests</h1>

      {/* Search Input */}
      <div className="mb-4 flex items-center">
        <label className="text-xs font-medium uppercase tracking-wider mr-2">Search:</label>
        <input
          type="text"
          placeholder="Search by project, requestor, destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-48 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
            darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
          }`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
            <tr>
              <th
                onClick={() => handleSort("job_id")}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Project {getSortIcon("job_id")}
              </th>
              <th
                onClick={() => handleSort("site_worker")}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Requestor {getSortIcon("site_worker")}
              </th>
              <th
                onClick={() => handleSort("request_date")}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Date {getSortIcon("request_date")}
              </th>
              <th
                onClick={() => handleSort("delivery_location")}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Destination {getSortIcon("delivery_location")}
              </th>
              <th
                onClick={() => handleSort("pickup_datetime")}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Pick-up Time {getSortIcon("pickup_datetime")}
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                Driver View
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"}`}>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-2 text-center text-xs">
                  No pick-up requests found.
                </td>
              </tr>
            ) : (
              sortedData.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">{request.job_id}</td>
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">{request.site_worker}</td>
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">
                    {request.request_date
                      ? new Date(request.request_date).toLocaleString("en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : ""}
                  </td>
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">
                    {/* For pickup requests, show the Destination value.
                        If a 'destination' field exists, use it; otherwise fallback to delivery_location */}
                    {request.destination || request.delivery_location || "-"}
                  </td>
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">
                    {request.pickup_datetime
                      ? new Date(request.pickup_datetime).toLocaleString("en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">
                    {user.role.toLowerCase() === "driver" ? (
                      request.status && request.status.toLowerCase() === "seen by driver" ? (
                        <span className="text-green-500 text-xs">Seen by Driver</span>
                      ) : (
                        <button
                          onClick={() => handleMarkSeen(request)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          disabled={processing}
                        >
                          Mark as Seen
                        </button>
                      )
                    ) : (
                      request.status || "Not Confirmed"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PickupRequests;
