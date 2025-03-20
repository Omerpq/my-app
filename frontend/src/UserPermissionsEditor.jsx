// src/UserPermissionsEditor.jsx
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";

// -------------- DarkModeToggleWrapper --------------
const DarkModeToggleWrapper = () => {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <div className="flex items-center">
      <label className="flex items-center cursor-pointer">
        <span className="mr-2 font-semibold text-gray-300">Dark Mode</span>
        <div className="relative">
          <input type="checkbox" className="sr-only" checked={darkMode} onChange={toggleTheme} />
          <div
            className={`block w-10 h-6 rounded-full transition-all duration-500 ${
              darkMode
                ? "bg-gradient-to-r from-red-700 to-[#800000] shadow-[0_0_14px_#800000]"
                : "bg-gray-600 shadow-inner"
            }`}
          ></div>
          <div
            className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform duration-500 ${
              darkMode
                ? "translate-x-4 bg-gray-300 shadow-[0_0_12px_#800000]"
                : "translate-x-1 bg-gray-600"
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};

// -----------------------------
// GROUP PERMISSIONS BY CATEGORY
// -----------------------------
const PERMISSIONS_GROUPS = {
  "Dashboard": ["canAccessDashboard"],
  "User Management": [
    "canAccessUserManagement",
    "canAccessUserPermissions",
    "canViewUsers",
    "canCreateUser",
    "canEditUser",
    "canDeleteUser",
  ],
  "Project Management": [
    "canAccessProjectManagement",
    "canViewProjects",
    "canCreateProject",
    "canEditProject",
    "canDeleteProject",
  ],
  "Inventory Management": [
    "canAccessInventoryManagement",
    "canViewStock",
    "canAddStockEntry",
    "canRequestStock",
    "canViewStockRequests",
    "canViewPickupRequests", // <-- New permission added here
    "canApproveStockRequests",
    "canDispatchStock",
    "canConfirmDelivery",
    "canViewAlerts",
    "canViewReports",
  ],
};

// -----------------------------
// MAP PERMISSION KEYS -> LABELS
// -----------------------------
const PERMISSION_LABELS = {
  // Dashboard
  canAccessDashboard: "Dashboard",
  // User Management
  canAccessUserManagement: "User Management",
  canAccessUserPermissions: "User Permissions",
  canViewUsers: "View",
  canCreateUser: "Create",
  canEditUser: "Edit",
  canDeleteUser: "Delete",
  // Project Management
  canAccessProjectManagement: "Project Management",
  canViewProjects: "View",
  canCreateProject: "Create",
  canEditProject: "Edit",
  canDeleteProject: "Delete",
  // Inventory Management
  canAccessInventoryManagement: "Inventory Management",
  canViewStock: "View Stock",
  canAddStockEntry: "Add Stock",
  canRequestStock: "Request Stock",
  canViewStockRequests: "View Stock Requests",
  canViewPickupRequests: "View Pickup Requests", // <-- New label added here
  canApproveStockRequests: "Approve Requests",
  canDispatchStock: "Dispatches",
  canConfirmDelivery: "View Delivery",
  canViewAlerts: "View Alerts",
  canViewReports: "View Reports",
};

const BASE_URL = "http://localhost:5000/api/users";

const UserPermissionsEditor = () => {
  const { user: currentUser } = useAuth();
  const { darkMode } = useTheme();

  // State for all users for the multi-select dropdown
  const [allUsers, setAllUsers] = useState([]);
  // selectedUsers is an array of option objects from react-select
  const [selectedUsers, setSelectedUsers] = useState([]);
  // For displaying permissions, we use the first selected user's data
  const [userData, setUserData] = useState(null);
  const [updatedPermissions, setUpdatedPermissions] = useState([]);

  // All permission groups expanded by default
  const [openGroups, setOpenGroups] = useState(() => {
    const init = {};
    Object.keys(PERMISSIONS_GROUPS).forEach((group) => {
      init[group] = true;
    });
    return init;
  });

  // -------------- Lifecycle --------------
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch(BASE_URL);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();

        // Exclude administrators from the drop-down
        const nonAdmins = data.filter((u) => u.role !== "Administrator");
        const options = nonAdmins.map((u) => ({
          value: u.id.toString(),
          label: `${u.name} (${u.role}) - ${u.email}`,
        }));
        setAllUsers(options);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      setUserData(null);
      setUpdatedPermissions([]);
      return;
    }
    const fetchUser = async () => {
      try {
        const firstUserId = selectedUsers[0].value;
        const res = await fetch(`${BASE_URL}/${firstUserId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUserData(data);
        setUpdatedPermissions(data.permissions || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, [selectedUsers]);

  // -------------- Handlers --------------
  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const togglePermission = (perm) => {
    setUpdatedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    try {
      for (const option of selectedUsers) {
        const uid = option.value;
        const res = await fetch(`${BASE_URL}/${uid}/permissions`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: updatedPermissions }),
        });
        if (!res.ok) throw new Error(`Failed to update permissions for user ${uid}`);
      }
      alert("Permissions updated successfully! Changes will take effect next time the user(s) log in.");
    } catch (error) {
      console.error("Error updating permissions:", error);
      alert("Failed to update permissions.");
    }
  };

  // -------------- Access check --------------
  if (currentUser.role !== "Administrator") {
    return <div>Access denied. Only administrators can update permissions.</div>;
  }

  // -------------- Container styling --------------
  const containerStyle = {
    backgroundColor: darkMode ? "#1a202c" : "#ffffff",
    borderColor: darkMode ? "#4a5568" : "#e2e8f0",
    color: darkMode ? "#ffffff" : "#1a202c",
  };

  // -------------- Chip styling --------------
  const getChipClasses = (groupName, perm) => {
    const enabled = updatedPermissions.includes(perm);
    const baseClasses = "cursor-pointer px-3 py-1 rounded-full text-sm transition-colors duration-200";
    const disabledClasses = "bg-gray-300 text-gray-900 hover:bg-gray-400";
    const enabledClasses = GROUP_ENABLED_COLORS[groupName] + " text-white";
    return `${baseClasses} ${enabled ? enabledClasses : disabledClasses}`;
  };

  // Define group-specific enabled chip colors
  const GROUP_ENABLED_COLORS = {
    "Dashboard": "bg-indigo-500 hover:bg-indigo-600",
    "User Management": "bg-blue-500 hover:bg-blue-600",
    "Project Management": "bg-orange-500 hover:bg-orange-600",
    "Inventory Management": "bg-teal-500 hover:bg-teal-600",
  };

  return (
    <div style={containerStyle} className="rounded-xl shadow-md border min-h-screen transition-all duration-500">
      {/* Header */}
      <header
        className={`${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"}
          flex justify-between items-center p-6 shadow-lg border`}
      >
        <div className="text-xl font-semibold">User Permissions</div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className={`${darkMode ? "text-yellow-600" : "text-gray-500"} text-sm`}>
              {currentUser.role}
            </span>
            <span className="text-xs">{currentUser.name}</span>
          </div>
          <DarkModeToggleWrapper />
        </div>
      </header>

      <div className="p-6">
        {/* Select user(s) block */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Select user(s):</label>
          <Select
            options={allUsers}
            value={selectedUsers}
            onChange={setSelectedUsers}
            isMulti
            closeMenuOnSelect={false}
            placeholder="Search and select users..."
            classNamePrefix="react-select"
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: darkMode ? "#2d3748" : "#ffffff",
                borderColor: darkMode ? "#4a5568" : "#e2e8f0",
                color: darkMode ? "#ffffff" : "#1a202c",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: darkMode ? "#2d3748" : "#ffffff",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused
                  ? darkMode
                    ? "#4a5568"
                    : "#e2e8f0"
                  : darkMode
                  ? "#2d3748"
                  : "#ffffff",
                color: darkMode ? "#ffffff" : "#1a202c",
              }),
              dropdownIndicator: (provided) => ({
                ...provided,
                color: darkMode ? "#ffffff" : "#1a202c",
                transition: "color 0.2s ease",
                ":hover": {
                  color: "#4299e1",
                },
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: darkMode ? "#4a5568" : "#e2e8f0",
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: darkMode ? "#ffffff" : "#1a202c",
              }),
              multiValueRemove: (provided) => ({
                ...provided,
                color: darkMode ? "#ffffff" : "#1a202c",
                ":hover": {
                  background: "linear-gradient(90deg, #e53e3e, #c53030)",
                  color: "#ffffff",
                },
              }),
              singleValue: (provided) => ({
                ...provided,
                color: darkMode ? "#ffffff" : "#1a202c",
              }),
              clearIndicator: (provided) => ({
                ...provided,
                color: darkMode ? "#ffffff" : "#1a202c",
                ":hover": {
                  color: "#ff0000",
                },
              }),
            }}
          />
        </div>

        {selectedUsers.length > 0 && userData && (
          <>
            {Object.entries(PERMISSIONS_GROUPS).map(([groupName, perms]) => (
              <div key={groupName} className="mb-6">
                <h4
                  className="text-lg font-semibold mb-2 cursor-pointer"
                  onClick={() => toggleGroup(groupName)}
                >
                  {groupName} {openGroups[groupName] ? "▼" : "▶"}
                </h4>
                {openGroups[groupName] && (
                  <div className="flex flex-wrap gap-2">
                    {perms.map((perm) => (
                      <div
                        key={perm}
                        className={getChipClasses(groupName, perm)}
                        onClick={() => togglePermission(perm)}
                        title={perm}
                      >
                        {PERMISSION_LABELS[perm] || perm}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={handleSave}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Save Permissions
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserPermissionsEditor;
