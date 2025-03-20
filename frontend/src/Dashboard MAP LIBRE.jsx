// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useTheme } from "./context/ThemeContext";
import { getDashboardStats } from "./api";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";

// Existing visualizations
import ThreeDPieChart from "./components/ThreeDPieChart";
// NEW: Import the MapLibreMap component instead of the GeoDistributionMap component
import MapLibreMap from "./components/MapLibreMap";

// ---- DashboardSection Component ----
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

const KpiCard = ({ title, value, borderColor }) => {
  const { darkMode } = useTheme();
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";

  return (
    <div
      className={`p-4 rounded-lg shadow-md transition-none ${cardBg} ${borderColor} border-l-4`}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-2xl">{value}</p>
    </div>
  );
};

const Dashboard = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { language } = useLanguage();
  const french = language === "fr";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            />
            <KpiCard
              title={french ? "Projets terminés" : "Completed Projects"}
              value={stats?.completed_projects ?? 0}
              borderColor="border-green-500"
            />
            <KpiCard
              title={french ? "Approbations en attente" : "Pending Approvals"}
              value={stats?.pendingApprovals ?? 0}
              borderColor="border-yellow-500"
            />
            <KpiCard
              title={french ? "Articles en rupture de stock" : "Low Inventory Items"}
              value={stats?.lowInventoryItems ?? 0}
              borderColor="border-orange-500"
            />
            <KpiCard
              title={french ? "Total des heures travaillées" : "Total Hours Worked"}
              value={stats?.totalHoursWorked ?? 0}
              borderColor="border-purple-500"
            />
            <KpiCard
              title={french ? "Temps moyen d'achèvement" : "Avg. Completion Time"}
              value={`${stats?.avgCompletionTime ?? 0} ${
                french ? "heures" : "hrs"
              }`}
              borderColor="border-indigo-500"
            />
            <KpiCard
              title={french ? "Projets en retard" : "Overdue Projects"}
              value={stats?.overdue_projects ?? 0}
              borderColor="border-red-500"
            />
          </>
        )}
      </main>

      {/* Dashboard Section: Projects Status */}
      <DashboardSection
        title={french ? "Répartition des projets" : "Projects Status"}
        darkMode={darkMode}
        french={french}
      >
        <ThreeDPieChart data={stats?.projectsStatusData || []} darkMode={darkMode} />
      </DashboardSection>

      {/* Dashboard Section: Geographic Distribution */}
      <section
        className={`p-6 m-4 rounded-lg shadow-md transition-none ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        <h2 className="text-xl font-semibold">
          {french ? "Distribution Géographique des Projets" : "Projects Geographic Distribution"}
        </h2>
        <div className="mt-2">
          <MapLibreMap darkMode={darkMode} data={stats?.projectLocations || []} />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
