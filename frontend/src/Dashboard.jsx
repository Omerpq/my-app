// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useTheme } from "./context/ThemeContext";
import { getDashboardStats } from "./api";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import ThreeDColumnChart from "./Components/ThreeDColumnChart";
// Existing visualizations
import ThreeDPieChart from "./Components/ThreeDPieChart";
import GeoDistributionMap from "./Components/GeoDistributionMap";

// NEW: Import the Eye icon from react-icons
import { FaEye } from "react-icons/fa";

// --------------------------
// Helper: Returns a gradient class for key columns based on dark mode
// --------------------------
const getKeyGradient = (darkMode) =>
  darkMode
    ? "bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent";

// --------------------------
// Modal Component for Low Inventory Items
// --------------------------
const LowInventoryModal = ({ isOpen, onClose, darkMode }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetch("https://my-app-1-uzea.onrender.com/api/inventory/lowstock")
        .then((res) => res.json())
        .then((data) => setItems(data))
        .catch((err) =>
          console.error("Failed to fetch low inventory items", err)
        );
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Define orange gradient for the key columns
  const orangeGradient = darkMode
    ? "bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-orange-600 to-orange-900 bg-clip-text text-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } rounded-lg shadow-lg max-w-3xl w-full p-6`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Low Inventory Items</h3>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${orangeGradient}`}
                >
                  Item Name
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${orangeGradient}`}
                >
                  Quantity
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className={`px-4 py-2 text-sm ${orangeGradient}`}>
                    {item.item_name}
                  </td>
                  <td className={`px-4 py-2 text-sm ${orangeGradient}`}>
                    {item.total_quantity || item.quantity}
                  </td>
                  <td className="px-4 py-2 text-sm">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --------------------------
// Modal Component for Total Hours Worked Details
// --------------------------
const TotalHoursModal = ({ isOpen, onClose, darkMode }) => {
  const [hoursDetails, setHoursDetails] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetch("https://my-app-1-uzea.onrender.com/api/projects/dashboard/hours")
        .then((res) => res.json())
        .then((data) => setHoursDetails(data))
        .catch((err) =>
          console.error("Failed to fetch total hours details", err)
        );
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Define purple gradient for the Hours Worked column
  const purpleGradient = darkMode
    ? "bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } rounded-lg shadow-lg max-w-4xl w-full p-6`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Total Hours Worked Details</h3>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Project
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Employee Role
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Employee Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Duty Staff
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${purpleGradient}`}
                >
                  Hours Worked
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {hoursDetails.map((detail, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{detail.project}</td>
                  <td className="px-4 py-2 text-sm">{detail.employee_role}</td>
                  <td className="px-4 py-2 text-sm">
                    {detail.employee_name || "--"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {detail.duty_staff || "--"}
                  </td>
                  <td className={`px-4 py-2 text-sm ${purpleGradient}`}>
                    {Math.round(detail.hours_worked || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --------------------------
// Modal Component for Avg. Completion Time Details
// --------------------------
const AvgCompletionModal = ({ isOpen, onClose, darkMode }) => {
  const [avgDetails, setAvgDetails] = useState({ projects: [], average: 0 });
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetch("https://my-app-1-uzea.onrender.com/api/projects/dashboard/avg-completion")
        .then((res) => res.json())
        .then((data) => setAvgDetails(data))
        .catch((err) =>
          console.error("Failed to fetch avg completion details", err)
        );
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  if (!isOpen) return null;

  // Define indigo gradient for the Hours Worked column
  const indigoGradient = darkMode
    ? "bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } rounded-lg shadow-lg max-w-4xl w-full p-6`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Avg. Completion Time Details</h3>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Project
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${indigoGradient}`}
                >
                  Hours Worked
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Start Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {avgDetails.projects.map((row, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{row.project}</td>
                  <td className={`px-4 py-2 text-sm ${indigoGradient}`}>
                    {Math.round(row.hours_worked)}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(row.start_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(row.end_date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <p className="text-lg font-semibold">
              Average Completion Time:{" "}
              <span className="font-bold">{avgDetails.average} hrs</span>
            </p>
            <p className="text-sm bg-gradient-to-r from-green-600 to-green-950 bg-clip-text text-transparent">
              Quickest project is the first row; longest project is the last row.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --------------------------
// Modal Component for Active Projects Details
// --------------------------
const ActiveProjectsModal = ({ isOpen, onClose, darkMode }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetch("https://my-app-1-uzea.onrender.com/api/projects/active")
        .then((res) => res.json())
        .then((data) => setProjects(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Failed to fetch active projects", err));
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const blueGradient = darkMode
    ? "bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } rounded-lg shadow-lg max-w-4xl w-full p-6`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Active Projects Details</h3>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${blueGradient}`}
                >
                  Project
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Manager
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Start Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Planned End Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((proj, index) => (
                <tr key={index}>
                  <td className={`px-4 py-2 text-sm ${blueGradient}`}>
                    {proj.job_id}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {proj.manager_name || "--"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(proj.start_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {proj.planned_end_date
                      ? new Date(proj.planned_end_date).toLocaleString()
                      : "--"}
                  </td>
                  <td className="px-4 py-2 text-sm">{proj.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --------------------------
// Modal Component for Completed Projects Details
// --------------------------
const CompletedProjectsModal = ({ isOpen, onClose, darkMode }) => {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetch("https://my-app-1-uzea.onrender.com/api/projects/completed")
        .then((res) => res.json())
        .then((data) => setProjects(Array.isArray(data) ? data : []))
        .catch((err) =>
          console.error("Failed to fetch completed projects", err)
        );
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  if (!isOpen) return null;

  // Define green gradient for Hours Worked column
  const greenGradient = darkMode
    ? "bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } rounded-lg shadow-lg max-w-4xl w-full p-6`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Completed Projects Details</h3>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Project
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${greenGradient}`}
                >
                  Hours Worked
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Start Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((proj, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{proj.job_id}</td>
                  <td className={`px-4 py-2 text-sm ${greenGradient}`}>
                    {Math.round(proj.hours_worked)}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(proj.start_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(proj.end_date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --------------------------
// Modal Component for Overdue Projects Details
// --------------------------
const OverdueProjectsModal = ({ isOpen, onClose, darkMode }) => {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetch("https://my-app-1-uzea.onrender.com/api/projects/overdue")
        .then((res) => res.json())
        .then((data) => setProjects(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Failed to fetch overdue projects", err));
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  if (!isOpen) return null;

  // Define red gradient for the key column (Days Overdue)
  const redGradient = darkMode
    ? "bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } rounded-lg shadow-lg max-w-4xl w-full p-6`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Overdue Projects Details</h3>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Project
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Planned End Date
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${redGradient}`}
                >
                  Days Overdue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((proj, index) => {
                const planned = new Date(proj.planned_end_date);
                const now = new Date();
                const diffMs = now - planned;
                const daysOverdue = Math.max(
                  Math.floor(diffMs / (1000 * 60 * 60 * 24)),
                  0
                );
                return (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{proj.job_id}</td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(proj.planned_end_date).toLocaleString()}
                    </td>
                    <td className={`px-4 py-2 text-sm ${redGradient}`}>
                      {daysOverdue}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --------------------------
// Modal Component for Pending Request Approvals Details
// --------------------------
const PendingRequestsModal = ({ isOpen, onClose, darkMode }) => {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetch("https://my-app-1-uzea.onrender.com/api/projects/request_stock/pending")
        .then((res) => res.json())
        .then((data) => setRequests(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Failed to fetch pending requests", err));
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  if (!isOpen) return null;

  // Define yellow gradient for the Pending Requests modal columns
  const yellowGradient = darkMode
    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-yellow-700 to-yellow-500 bg-clip-text text-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } rounded-lg shadow-lg max-w-4xl w-full p-6`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Pending Request Approvals</h3>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Site Worker
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${yellowGradient}`}
                >
                  Item
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${yellowGradient}`}
                >
                  Quantity
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Request Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Delivery Location
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Project
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((req, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{req.site_worker}</td>
                  <td className={`px-4 py-2 text-sm ${yellowGradient}`}>
                    {req.item_name} — {req.item_code}
                  </td>
                  <td className={`px-4 py-2 text-sm ${yellowGradient}`}>
                    {req.quantity}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(req.request_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">{req.delivery_location}</td>
                  <td className="px-4 py-2 text-sm">{req.job_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --------------------------
// Modal Component for Approved Requests Details
// --------------------------
const ApprovedRequestsModal = ({ isOpen, onClose, darkMode }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetch("https://my-app-1-uzea.onrender.com/api/projects/request_stock/approved")
        .then((res) => res.json())
        .then((data) => setRequests(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Failed to fetch approved requests", err));
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const keyGradient = darkMode
    ? "bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50">
      <div
        className={`
          ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} 
          rounded-lg shadow-lg max-w-4xl w-full p-6 pt-4 
          mt-12 md:mt-8 
          max-h-[90vh] overflow-auto
        `}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Approved Requests</h3>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Site Worker
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${keyGradient}`}
                >
                  Item
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Quantity
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Request Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Decision By
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${keyGradient}`}
                >
                  Decision Time
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Delivery Location
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Project
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((req, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{req.site_worker}</td>
                  <td className={`px-4 py-2 text-sm ${keyGradient}`}>
                    {req.item_name} — {req.item_code}
                  </td>
                  <td className="px-4 py-2 text-sm">{req.quantity}</td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(req.request_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {req.decision_by || "--"}
                  </td>
                  <td className={`px-4 py-2 text-sm ${keyGradient}`}>
                    {req.decision_time
                      ? new Date(req.decision_time).toLocaleString()
                      : "--"}
                  </td>
                  <td className="px-4 py-2 text-sm">{req.delivery_location}</td>
                  <td className="px-4 py-2 text-sm">{req.job_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --------------------------
// Modal Component for Rejected Requests Details
// --------------------------
const RejectedRequestsModal = ({ isOpen, onClose, darkMode }) => {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      fetch("https://my-app-1-uzea.onrender.com/api/projects/request_stock/rejected")
        .then((res) => res.json())
        .then((data) => setRequests(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Failed to fetch rejected requests", err));
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  if (!isOpen) return null;

  const redGradient = darkMode
    ? "bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-red-500 to-red-800 bg-clip-text text-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        } rounded-lg shadow-lg max-w-4xl w-full p-6`}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Rejected Requests</h3>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Site Worker
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${redGradient}`}
                >
                  Item
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Quantity
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Request Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Decision By
                </th>
                <th
                  className={`px-4 py-2 text-left text-xs font-medium uppercase ${redGradient}`}
                >
                  Decision Time
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Delivery Location
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">
                  Project
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((req, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{req.site_worker}</td>
                  <td className={`px-4 py-2 text-sm ${redGradient}`}>
                    {req.item_name} — {req.item_code}
                  </td>
                  <td className="px-4 py-2 text-sm">{req.quantity}</td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(req.request_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {req.decision_by || "--"}
                  </td>
                  <td className={`px-4 py-2 text-sm ${redGradient}`}>
                    {req.decision_time
                      ? new Date(req.decision_time).toLocaleString()
                      : "--"}
                  </td>
                  <td className="px-4 py-2 text-sm">{req.delivery_location}</td>
                  <td className="px-4 py-2 text-sm">{req.job_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --------------------------
// DashboardSection Component (unchanged)
// --------------------------
const DashboardSection = ({ title, darkMode, french, children, data }) => {
  const sectionBg = darkMode ? "bg-gray-800" : "bg-white";
  const sectionText = darkMode ? "text-white" : "text-black";

  return (
    <section
      className={`p-6 m-4 rounded-lg shadow-md transition-none ${sectionBg} ${sectionText}`}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-2">
        {children ? (
          children
        ) : title.toLowerCase().includes("status") ||
          title.toLowerCase().includes("répartition") ? (
          <ThreeDPieChart data={data} darkMode={darkMode} />
        ) : (
          <p>
            {french
              ? `Contenu pour ${title} ici.`
              : `Content for ${title} goes here.`}
          </p>
        )}
      </div>
    </section>
  );
};

// --------------------------
// KpiCard Component with Left Accent (unchanged)
// --------------------------
const KpiCard = ({ title, value, borderColor, actionIcon, onAction }) => {
  const { darkMode } = useTheme();
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";

  return (
    <div
      className={`p-4 rounded-lg shadow-md transition-none ${cardBg} ${borderColor} border-l-4 flex items-center justify-between`}
    >
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-2xl">{value}</p>
      </div>
      {actionIcon && (
        <div onClick={onAction} className="cursor-pointer ml-4">
          {actionIcon}
        </div>
      )}
    </div>
  );
};

// --------------------------
// Main Dashboard Component
// --------------------------
const Dashboard = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { language } = useLanguage();
  const french = language === "fr";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showActiveProjectsModal, setShowActiveProjectsModal] = useState(false);
  const [showCompletedProjectsModal, setShowCompletedProjectsModal] = useState(false);
  const [showOverdueProjectsModal, setShowOverdueProjectsModal] = useState(false);
  const [showPendingRequestsModal, setShowPendingRequestsModal] = useState(false);
  const [showApprovedRequestsModal, setShowApprovedRequestsModal] = useState(false);
  const [showRejectedRequestsModal, setShowRejectedRequestsModal] = useState(false);
  const [showLowInventoryModal, setShowLowInventoryModal] = useState(false);
  const [showTotalHoursModal, setShowTotalHoursModal] = useState(false);
  const [showAvgCompletionModal, setShowAvgCompletionModal] = useState(false);

  // Minimal addition: hold inventory data for the chart
  const [inventoryData, setInventoryData] = useState([]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        console.log("Fetched stats from API:", data);
        setStats(data);
      } catch (err) {
        setError(
          french
            ? "Échec du chargement des données du tableau de bord."
            : "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [french]);

  // Minimal addition: fetch inventory data & handle 404 or non-array
  useEffect(() => {
    fetch("https://my-app-1-uzea.onrender.com/api/inventory/levels")
      .then((res) => {
        if (!res.ok) {
          console.error("Inventory endpoint returned:", res.status);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setInventoryData(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch inventory data", err);
        setInventoryData([]);
      });
  }, []);

  return (
    <div
      className={`flex-1 min-h-screen transition-none ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Header */}
      <header
        className={`flex justify-between items-center p-6 shadow-lg transition-none ${
          darkMode
            ? "bg-gray-800 text-white border border-gray-700"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <div className="text-xl font-semibold">
          {french ? "Tableau de bord" : "Dashboard"}
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex flex-col text-right">
              <span className="text-sm text-yellow-600">{user.role}</span>
              <span className="text-xs">{user.name}</span>
            </div>
          )}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <span
                className={`mr-2 font-semibold ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {french ? "Mode sombre" : "Dark Mode"}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={darkMode}
                  onChange={toggleTheme}
                />
                <div
                  className={`block w-10 h-6 rounded-full transition-none ${
                    darkMode
                      ? "bg-gradient-to-r from-red-700 to-[#800000] shadow-[0_0_14px_#800000]"
                      : "bg-gray-600 shadow-inner"
                  }`}
                ></div>
                <div
                  className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-none ${
                    darkMode
                      ? "translate-x-4 bg-gray-300 shadow-[0_0_12px_#800000]"
                      : "translate-x-1 bg-gray-600"
                  }`}
                ></div>
              </div>
            </label>
          </div>
        </div>
      </header>

      {error && <p className="p-4 text-red-500">{error}</p>}

      {/* KPI Cards */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-center col-span-3">
            {french ? "Chargement..." : "Loading..."}
          </p>
        ) : (
          <>
            <KpiCard
              title={french ? "Projets actifs" : "Active Projects"}
              value={stats?.active_projects ?? 0}
              borderColor="border-blue-500"
              actionIcon={<FaEye className="text-xl text-blue-500" />}
              onAction={() => setShowActiveProjectsModal(true)}
            />
            <KpiCard
              title={french ? "Projets terminés" : "Completed Projects"}
              value={stats?.completed_projects ?? 0}
              borderColor="border-green-500"
              actionIcon={<FaEye className="text-xl text-green-500" />}
              onAction={() => setShowCompletedProjectsModal(true)}
            />
            <KpiCard
              title={french ? "Projets en retard" : "Overdue Projects"}
              value={stats?.overdue_projects ?? 0}
              borderColor="border-red-500"
              actionIcon={<FaEye className="text-xl text-red-500" />}
              onAction={() => setShowOverdueProjectsModal(true)}
            />
            <KpiCard
              title={
                french
                  ? "Approbations de demandes en attente"
                  : "Pending Request Approvals"
              }
              value={stats?.pendingApprovals ?? 0}
              borderColor="border-yellow-500"
              actionIcon={<FaEye className="text-xl text-yellow-500" />}
              onAction={() => setShowPendingRequestsModal(true)}
            />
            <KpiCard
              title={french ? "Demandes approuvées" : "Approved Requests"}
              value={stats?.approvedRequests ?? 0}
              borderColor="border-green-700"
              actionIcon={<FaEye className="text-xl text-green-600" />}
              onAction={() => setShowApprovedRequestsModal(true)}
            />
            <KpiCard
              title={french ? "Demandes rejetées" : "Rejected Requests"}
              value={stats?.rejectedRequests ?? 0}
              borderColor="border-red-700"
              actionIcon={<FaEye className="text-xl text-red-700" />}
              onAction={() => setShowRejectedRequestsModal(true)}
            />
            <KpiCard
              title={
                french ? "Articles en rupture de stock" : "Low Inventory Items"
              }
              value={stats?.lowInventoryItems ?? 0}
              borderColor="border-orange-500"
              actionIcon={
                stats?.lowInventoryItems > 0 ? (
                  <FaEye className="text-xl text-orange-500" />
                ) : (
                  <FaEye className="text-xl text-gray-400" />
                )
              }
              onAction={
                stats?.lowInventoryItems > 0
                  ? () => setShowLowInventoryModal(true)
                  : undefined
              }
            />
            <KpiCard
              title={
                french ? "Total des heures travaillées" : "Total Hours Worked"
              }
              value={stats?.totalHoursWorked ?? 0}
              borderColor="border-purple-500"
              actionIcon={
                stats?.totalHoursWorked > 0 ? (
                  <FaEye className="text-xl text-purple-500" />
                ) : (
                  <FaEye className="text-xl text-gray-400" />
                )
              }
              onAction={
                stats?.totalHoursWorked > 0
                  ? () => setShowTotalHoursModal(true)
                  : undefined
              }
            />
            <KpiCard
              title={
                french ? "Temps moyen d'achèvement" : "Avg. Completion Time"
              }
              value={`${stats?.avgCompletionTime ?? 0} ${
                french ? "heures" : "hrs"
              }`}
              borderColor="border-indigo-500"
              actionIcon={<FaEye className="text-xl text-indigo-500" />}
              onAction={() => setShowAvgCompletionModal(true)}
            />
          </>
        )}
      </main>

      {/* Updated Dashboard Sections: Each in its own row */}
      <div className="grid grid-cols-1 gap-0 m-2">
        <DashboardSection
          title={french ? "Répartition des projets" : "Projects Status"}
          darkMode={darkMode}
          french={french}
        >
          <ThreeDPieChart data={stats?.projectsStatusData || []} darkMode={darkMode} />
        </DashboardSection>

        <DashboardSection
          title={french ? "Niveaux d'inventaire" : "Inventory Levels"}
          darkMode={darkMode}
          french={french}
        >
          <ThreeDColumnChart data={inventoryData || []} darkMode={darkMode} />
        </DashboardSection>
      </div>

      {/* Dashboard Section: Geographic Distribution */}
      <section
        className={`p-6 m-4 rounded-lg shadow-md transition-none ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        <h2 className="text-xl font-semibold">
          {french
            ? "Distribution Géographique des Projets"
            : "Projects Geographic Distribution"}
        </h2>
        <div className="mt-2">
          <GeoDistributionMap darkMode={darkMode} data={stats?.projectLocations || []} />
        </div>
      </section>

      {/* Modals */}
      <ActiveProjectsModal isOpen={showActiveProjectsModal} onClose={() => setShowActiveProjectsModal(false)} darkMode={darkMode} />
      <CompletedProjectsModal isOpen={showCompletedProjectsModal} onClose={() => setShowCompletedProjectsModal(false)} darkMode={darkMode} />
      <OverdueProjectsModal isOpen={showOverdueProjectsModal} onClose={() => setShowOverdueProjectsModal(false)} darkMode={darkMode} />
      <PendingRequestsModal isOpen={showPendingRequestsModal} onClose={() => setShowPendingRequestsModal(false)} darkMode={darkMode} />
      <ApprovedRequestsModal isOpen={showApprovedRequestsModal} onClose={() => setShowApprovedRequestsModal(false)} darkMode={darkMode} />
      <RejectedRequestsModal isOpen={showRejectedRequestsModal} onClose={() => setShowRejectedRequestsModal(false)} darkMode={darkMode} />
      <LowInventoryModal isOpen={showLowInventoryModal} onClose={() => setShowLowInventoryModal(false)} darkMode={darkMode} />
      <TotalHoursModal isOpen={showTotalHoursModal} onClose={() => setShowTotalHoursModal(false)} darkMode={darkMode} />
      <AvgCompletionModal isOpen={showAvgCompletionModal} onClose={() => setShowAvgCompletionModal(false)} darkMode={darkMode} />
    </div>
  );
};

export default Dashboard;
