// src/Components/StockRequests.jsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const StockRequests = ({ onStatusChange }) => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  if (!user) return null; // Guard if user is not loaded

  const [rows, setRows] = useState([]);
  const [usersData, setUsersData] = useState([]); // For complete user info
  const [searchTerm, setSearchTerm] = useState("");
  const [chipFilter, setChipFilter] = useState("All");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [processing, setProcessing] = useState(false);
  const baseUrl = process.env.VITE_BACKEND_URL || "https://my-app-1-uzea.onrender.com";
  const adminEmail = process.env.VITE_ADMIN_EMAIL;

  const isSiteWorker = user.role === "SiteWorker";
  const isManagerOrAdmin =
    user.role === "InventoryManager" ||
    user.role === "Administrator" ||
    user.role === "Manager";

  // For site workers, filter rows by their own email.
  const visibleRows = isSiteWorker
    ? rows.filter((row) => row.requestor_email === user.email)
    : rows;

  // Define showUrgencyColumn based on any non‑"normal" urgency values.
  const showUrgencyColumn = visibleRows.some(
    (row) => row.urgency && row.urgency.trim().toLowerCase() !== "normal"
  );

  // Fetch complete user info for "Decision by" column.
  useEffect(() => {
    fetch(`${baseUrl}/api/users`)
      .then((response) => response.json())
      .then((data) => setUsersData(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, [baseUrl]);

  // Helper to return gradient text classes based on status.
  const getGradientTextClass = (status) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "approved") {
      return "bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text";
    } else if (s === "rejected") {
      return "bg-gradient-to-r from-red-400 to-red-600 text-transparent bg-clip-text";
    } else if (s === "pending") {
      return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text";
    }
    return "";
  };

  // Helper: returns a styled badge based on status.
  const getStatusBadge = (status) => {
    if (status === "Approved") {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 animate-pulse">
          Approved
        </span>
      );
    } else if (status === "Rejected") {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 animate-pulse">
          Rejected
        </span>
      );
    } else if (status === "Pending") {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 animate-pulse">
          Pending
        </span>
      );
    }
    return <span className="text-xs">{status}</span>;
  };

  // Send a notification request to the backend.
  const sendNotification = async (request, decision) => {
    const notificationPayload = {
      requesterEmail: request.requestor_email || "",
      approverEmail: user.email,
      adminEmail: adminEmail || "",
      decision,
      item: `${request.item_code} - ${request.item_name}`,
      requestId: request.id,
    };

    try {
      const res = await fetch(`${baseUrl}/api/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationPayload),
      });
      if (!res.ok) {
        console.error("Notification failed:", res.statusText);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  useEffect(() => {
    const endpoint = `${baseUrl}/api/request_stock`;
    console.log("Fetching stock requests from:", endpoint);
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => setRows(data))
      .catch((error) => console.error("Error fetching stock requests:", error));
  }, [baseUrl]);

  // Update search filter (includes various fields except request_type, since we no longer show it)
  const filteredData = visibleRows.filter((row) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const searchIn = `
      ${row.site_worker}
      ${row.item_code}
      ${row.item_name}
      ${row.quantity}
      ${row.delivery_location || ""}
      ${row.urgency || ""}
    `.toLowerCase();
    return searchIn.includes(term);
  });

  // Apply chip filter for approval status.
  const finalData = filteredData.filter((row) => {
    if (chipFilter === "All") return true;
    const decision = row.approval_status ? row.approval_status : "Pending";
    return decision.toLowerCase() === chipFilter.toLowerCase();
  });

  // Minimal change: Only include rows where request_type is exactly "stock"
  const typeFilteredData = finalData.filter(
    (row) => row.request_type.toLowerCase() === "stock"
  );

  // Sorting logic.
  const sortedData = sortField
    ? [...typeFilteredData].sort((a, b) => {
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
    : typeFilteredData;

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
        <span className={`ml-1 font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>↑</span>
      ) : (
        <span className={`ml-1 font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>↓</span>
      );
    }
    return <span className={`ml-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>↕</span>;
  };

  const handleApprove = async (request) => {
    if (!window.confirm("Are you sure you want to approve this request?")) return;
    const payload = {
      decision_by: user.name,
      decision_time: new Date().toISOString(),
      approverEmail: user.email,
    };
    setProcessing(true);
    try {
      const res = await fetch(`${baseUrl}/api/request_stock/${request.id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setRows((prevRows) =>
          prevRows.map((r) =>
            r.id === request.id
              ? {
                  ...r,
                  decision_by: user.name,
                  decision_time: payload.decision_time,
                  // For stock requests, the approval_status should now be "Approved"
                  approval_status: "Approved",
                }
              : r
          )
        );
        sendNotification(request, "Approved");
        if (onStatusChange) onStatusChange();
      }
    } catch (error) {
      console.error("Error approving request:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    const payload = {
      decision_by: user.name,
      decision_time: new Date().toISOString(),
      approverEmail: user.email,
    };
    setProcessing(true);
    try {
      const res = await fetch(`${baseUrl}/api/request_stock/${request.id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setRows((prevRows) =>
          prevRows.map((r) =>
            r.id === request.id
              ? {
                  ...r,
                  decision_by: user.name,
                  decision_time: payload.decision_time,
                  approval_status: "Rejected",
                }
              : r
          )
        );
        sendNotification(request, "Rejected");
        if (onStatusChange) onStatusChange();
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className={`max-w-full mx-auto p-8 rounded-xl transition-all duration-500 transform ${
        darkMode
          ? "bg-gray-800 text-white shadow-lg border border-gray-700"
          : "bg-white text-gray-900 shadow-2xl border border-gray-200"
      }`}
      style={{ overflowX: "hidden" }}
    >
      <h1 className="text-3xl font-bold text-center mb-6">Stock Requests</h1>

      {/* Search Input and Chips */}
      <div className="mb-4 flex items-center">
        <label className="text-xs font-medium uppercase tracking-wider mr-2">Search:</label>
        <input
          type="text"
          placeholder="Search by requestor, item, quantity..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-48 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
            darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
          }`}
        />
        <div className="ml-auto flex space-x-2">
          <button
            onClick={() => setChipFilter("All")}
            className={`px-3 py-1 rounded cursor-pointer text-xs transition-colors duration-300 ${
              chipFilter === "All"
                ? "bg-blue-500 text-white ring-2 ring-offset-2"
                : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setChipFilter("Pending")}
            className={`px-3 py-1 rounded cursor-pointer text-xs transition-colors duration-300 ${
              chipFilter === "Pending"
                ? "bg-[#ff9933] text-white ring-2 ring-offset-2"
                : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setChipFilter("Approved")}
            className={`px-3 py-1 rounded cursor-pointer text-xs transition-colors duration-300 ${
              chipFilter === "Approved"
                ? "bg-green-500 text-white ring-2 ring-offset-2"
                : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setChipFilter("Rejected")}
            className={`px-3 py-1 rounded cursor-pointer text-xs transition-colors duration-300 ${
              chipFilter === "Rejected"
                ? "bg-red-500 text-white ring-2 ring-offset-2"
                : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className={darkMode ? "bg-gray-700" : "bg-gray-100"}>
            <tr>
              <th
                onClick={() => handleSort("job_id")}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                PROJECT {getSortIcon("job_id")}
              </th>
              {isManagerOrAdmin && (
                <th
                  onClick={() => handleSort("site_worker")}
                  className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                >
                  Requestor {getSortIcon("site_worker")}
                </th>
              )}
              <th
                onClick={() => handleSort("request_date")}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Date {getSortIcon("request_date")}
              </th>
              <th
                onClick={() => handleSort("item_code")}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Item {getSortIcon("item_code")}
              </th>
              <th
                onClick={() => handleSort("quantity")}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Quantity {getSortIcon("quantity")}
              </th>
              <th
                onClick={() => handleSort("delivery_location")}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Delivery Location {getSortIcon("delivery_location")}
              </th>
              {showUrgencyColumn && (
                <th
                  onClick={() => handleSort("urgency")}
                  className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                >
                  Urgency {getSortIcon("urgency")}
                </th>
              )}
              {user.role === "Driver" && (
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                  Decision
                </th>
              )}
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                Decision by
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                Decision Time
              </th>
              {(isManagerOrAdmin || isSiteWorker) && (
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                  {/* ACTIONS column now displays the approval_status value */}
                  {user.permissions && user.permissions.includes("canApproveStockRequests")
                    ? "Actions"
                    : "Decision"}
                </th>
              )}
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"}`}>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-2 text-center text-xs">
                  No stock requests found.
                </td>
              </tr>
            ) : (
              sortedData.map((request) => (
                <tr key={request.id}>
                  <td className={`px-4 py-2 text-xs whitespace-normal break-words ${getGradientTextClass(request.status)}`}>
                    {request.job_id}
                  </td>
                  {isManagerOrAdmin && (
                    <td className="px-4 py-2 text-xs whitespace-normal break-words">
                      {request.requestor_role && request.requestor_id
                        ? `${request.site_worker} - ${request.requestor_role} (ID: ${request.requestor_id})`
                        : request.site_worker}
                    </td>
                  )}
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">
                    {request.request_date
                      ? new Date(request.request_date).toLocaleString("en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : ""}
                  </td>
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">
                    {`${request.item_code} - ${request.item_name}`}
                  </td>
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">
                    {request.quantity}
                  </td>
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">
                    {request.delivery_location || "-"}
                  </td>
                  {showUrgencyColumn && (
                    <td className="px-4 py-2 text-xs whitespace-normal break-words">
                      {request.urgency && request.urgency.trim().toLowerCase() !== "normal"
                        ? request.urgency
                        : "Normal"}
                    </td>
                  )}
                  {user.role === "Driver" && (
                    <td className="px-4 py-2 text-xs whitespace-normal break-words">
                      {request.status ? request.status : "Pending"}
                    </td>
                  )}
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">
                    {(() => {
                      const decisionUser = usersData.find((u) => u.name === request.decision_by);
                      return decisionUser && decisionUser.role && decisionUser.id
                        ? `${decisionUser.name} - ${decisionUser.role} (ID: ${decisionUser.id})`
                        : request.decision_by || "-";
                    })()}
                  </td>
                  <td className="px-4 py-2 text-xs whitespace-normal break-words">
                    {request.decision_time
                      ? new Date(request.decision_time).toLocaleString("en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "-"}
                  </td>
                  {(isManagerOrAdmin || isSiteWorker) && (
                    <td className="px-4 py-2 text-xs whitespace-normal break-words">
                      {isSiteWorker ? (
                        <span>{request.approval_status || "-"}</span>
                      ) : (
                        request.approval_status &&
                        request.approval_status.toLowerCase() === "pending" ? (
                          user.permissions && user.permissions.includes("canApproveStockRequests") ? (
                            <>
                              <button
                                onClick={() => handleApprove(request)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2 text-xs"
                                disabled={processing}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                                disabled={processing}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span>{request.approval_status || "Pending"}</span>
                          )
                        ) : (
                          getStatusBadge(request.approval_status)
                        )
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockRequests;
