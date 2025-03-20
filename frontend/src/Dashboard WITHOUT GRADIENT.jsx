// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useTheme } from "./context/ThemeContext";
import { getDashboardStats } from "./api";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";

// Existing visualizations
import ThreeDPieChart from "./components/ThreeDPieChart";
import GeoDistributionMap from "./components/GeoDistributionMap";

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
      fetch("http://localhost:5000/api/inventory/lowstock")
        .then((res) => res.json())
        .then((data) => setItems(data))
        .catch((err) => console.error("Failed to fetch low inventory items", err));
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const keyGradient = getKeyGradient(darkMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} rounded-lg shadow-lg max-w-3xl w-full p-6`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Low Inventory Items</h3>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${keyGradient}`}>Item Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className={`px-4 py-2 text-sm ${keyGradient}`}>{item.item_name}</td>
                  <td className="px-4 py-2 text-sm">{item.total_quantity || item.quantity}</td>
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
      fetch("http://localhost:5000/api/projects/dashboard/hours")
        .then((res) => res.json())
        .then((data) => setHoursDetails(data))
        .catch((err) => console.error("Failed to fetch total hours details", err));
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const keyGradient = getKeyGradient(darkMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} rounded-lg shadow-lg max-w-4xl w-full p-6`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Total Hours Worked Details</h3>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Project</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Employee Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Employee Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Duty Staff</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${keyGradient}`}>Hours Worked</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {hoursDetails.map((detail, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{detail.project}</td>
                  <td className="px-4 py-2 text-sm">{detail.employee_role}</td>
                  <td className="px-4 py-2 text-sm">{detail.employee_name || "--"}</td>
                  <td className="px-4 py-2 text-sm">{detail.duty_staff || "--"}</td>
                  <td className={`px-4 py-2 text-sm ${keyGradient}`}>{Math.round(detail.hours_worked || 0)}</td>
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
      fetch("http://localhost:5000/api/projects/dashboard/avg-completion")
        .then((res) => res.json())
        .then((data) => setAvgDetails(data))
        .catch((err) => console.error("Failed to fetch avg completion details", err));
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  const keyGradient = getKeyGradient(darkMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} rounded-lg shadow-lg max-w-4xl w-full p-6`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Avg. Completion Time Details</h3>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Project</th>
                <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${keyGradient}`}>
                  Hours Worked
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Start Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {avgDetails.projects.map((row, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 text-sm">{row.project}</td>
                  <td className={`px-4 py-2 text-sm ${keyGradient}`}>{Math.round(row.hours_worked)}</td>
                  <td className="px-4 py-2 text-sm">{new Date(row.start_date).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm">{new Date(row.end_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <p className="text-lg font-semibold">
              Average Completion Time:{" "}
              <span className="font-bold">{avgDetails.average} hrs</span>
            </p>
            <p className="text-sm bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
              Quickest project is the first row; longest project is the last row.
            </p>
          </div>
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
    <section className={`p-6 m-4 rounded-lg shadow-md transition-none ${sectionBg} ${sectionText}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-2">
        {children ? (
          children
        ) : title.toLowerCase().includes("status") || title.toLowerCase().includes("répartition") ? (
          <ThreeDPieChart data={data} darkMode={darkMode} />
        ) : (
          <p>{french ? `Contenu pour ${title} ici.` : `Content for ${title} goes here.`}</p>
        )}
      </div>
    </section>
  );
};

// --------------------------
// KpiCard Component (unchanged)
// --------------------------
const KpiCard = ({ title, value, borderColor, actionIcon, onAction }) => {
  const { darkMode } = useTheme();
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";

  return (
    <div className={`p-4 rounded-lg shadow-md transition-none ${cardBg} ${borderColor} border-l-4 flex items-center justify-between`}>
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
  const [showLowInventoryModal, setShowLowInventoryModal] = useState(false);
  const [showTotalHoursModal, setShowTotalHoursModal] = useState(false);
  const [showAvgCompletionModal, setShowAvgCompletionModal] = useState(false);

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

  return (
    <div className={`flex-1 min-h-screen transition-none ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {/* Header */}
      <header className={`flex justify-between items-center p-6 shadow-lg transition-none ${darkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-900 border border-gray-200"}`}>
        <div className="text-xl font-semibold">{french ? "Tableau de bord" : "Dashboard"}</div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex flex-col text-right">
              <span className="text-sm text-yellow-600">{user.role}</span>
              <span className="text-xs">{user.name}</span>
            </div>
          )}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <span className={`mr-2 font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{french ? "Mode sombre" : "Dark Mode"}</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={darkMode} onChange={toggleTheme} />
                <div className={`block w-10 h-6 rounded-full transition-none ${darkMode ? "bg-gradient-to-r from-red-700 to-[#800000] shadow-[0_0_14px_#800000]" : "bg-gray-600 shadow-inner"}`}></div>
                <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-none ${darkMode ? "translate-x-4 bg-gray-300 shadow-[0_0_12px_#800000]" : "translate-x-1 bg-gray-600"}`}></div>
              </div>
            </label>
          </div>
        </div>
      </header>

      {error && <p className="p-4 text-red-500">{error}</p>}

      {/* KPI Cards */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-center col-span-3">{french ? "Chargement..." : "Loading..."}</p>
        ) : (
          <>
            <KpiCard title={french ? "Projets actifs" : "Active Projects"} value={stats?.active_projects ?? 0} borderColor="border-blue-500" />
            <KpiCard title={french ? "Projets terminés" : "Completed Projects"} value={stats?.completed_projects ?? 0} borderColor="border-green-500" />
            <KpiCard title={french ? "Projets en retard" : "Overdue Projects"} value={stats?.overdue_projects ?? 0} borderColor="border-red-500" />
            <KpiCard title={french ? "Approbations de demandes en attente" : "Pending Request Approvals"} value={stats?.pendingApprovals ?? 0} borderColor="border-yellow-500" />
            <KpiCard title={french ? "Demandes approuvées" : "Approved Requests"} value={stats?.approvedRequests ?? 0} borderColor="border-green-700" />
            <KpiCard title={french ? "Demandes rejetées" : "Rejected Requests"} value={stats?.rejectedRequests ?? 0} borderColor="border-red-700" />
            <KpiCard
              title={french ? "Articles en rupture de stock" : "Low Inventory Items"}
              value={stats?.lowInventoryItems ?? 0}
              borderColor="border-orange-500"
              actionIcon={stats?.lowInventoryItems > 0 ? (<FaEye className="text-xl text-orange-500" />) : (<FaEye className="text-xl text-gray-400" />)}
              onAction={stats?.lowInventoryItems > 0 ? () => setShowLowInventoryModal(true) : undefined}
            />
            <KpiCard
              title={french ? "Total des heures travaillées" : "Total Hours Worked"}
              value={stats?.totalHoursWorked ?? 0}
              borderColor="border-purple-500"
              actionIcon={stats?.totalHoursWorked > 0 ? (<FaEye className="text-xl text-purple-500" />) : (<FaEye className="text-xl text-gray-400" />)}
              onAction={stats?.totalHoursWorked > 0 ? () => setShowTotalHoursModal(true) : undefined}
            />
            <KpiCard
              title={french ? "Temps moyen d'achèvement" : "Avg. Completion Time"}
              value={`${stats?.avgCompletionTime ?? 0} ${french ? "heures" : "hrs"}`}
              borderColor="border-indigo-500"
              actionIcon={<FaEye className="text-xl text-indigo-500" />}
              onAction={() => setShowAvgCompletionModal(true)}
            />
          </>
        )}
      </main>

      {/* Dashboard Section: Projects Status */}
      <DashboardSection title={french ? "Répartition des projets" : "Projects Status"} darkMode={darkMode} french={french}>
        <ThreeDPieChart data={stats?.projectsStatusData || []} darkMode={darkMode} />
      </DashboardSection>

      {/* Dashboard Section: Geographic Distribution */}
      <section className={`p-6 m-4 rounded-lg shadow-md transition-none ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
        <h2 className="text-xl font-semibold">{french ? "Distribution Géographique des Projets" : "Projects Geographic Distribution"}</h2>
        <div className="mt-2">
          <GeoDistributionMap darkMode={darkMode} data={stats?.projectLocations || []} />
        </div>
      </section>

      {/* Modals */}
      <LowInventoryModal isOpen={showLowInventoryModal} onClose={() => setShowLowInventoryModal(false)} darkMode={darkMode} />
      <TotalHoursModal isOpen={showTotalHoursModal} onClose={() => setShowTotalHoursModal(false)} darkMode={darkMode} />
      <AvgCompletionModal isOpen={showAvgCompletionModal} onClose={() => setShowAvgCompletionModal(false)} darkMode={darkMode} />
    </div>
  );
};

export default Dashboard;
