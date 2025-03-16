// src/UserPermissionsEditor.jsx
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";

// -----------------------------
// GROUP PERMISSIONS BY CATEGORY
// Added "Dashboard" group at the top with its sub-permission.
// -----------------------------
const PERMISSIONS_GROUPS = {
  "Dashboard": [
    "canAccessDashboard"
  ],
  "User Management": [
    "canAccessUserManagement",
    "canViewUsers",
    "canCreateUser",
    "canEditUser",
    "canDeleteUser"
    // "canAssignUserRoles"
  ],
  "Project Management": [
    "canAccessProjectManagement",
    "canViewProjects",
    "canCreateProject",
    "canEditProject",
    "canDeleteProject",
    "canManageProjectTeam"
  ],
  "Inventory Management": [
    "canAccessInventoryManagement", // <-- Restored
    "canViewStock",
    "canAddStockEntry",
    "canRequestStock",
    "canViewStockRequests",
    "canApproveStockRequests",
    "canDispatchStock",
    "canConfirmDelivery",
    "canViewAlerts",
    "canViewReports"
  ]
};

// -----------------------------
// MAP PERMISSION KEYS -> LABELS
// -----------------------------
const PERMISSION_LABELS = {
  // Dashboard
  canAccessDashboard: "Dashboard",
  // User Management
  canAccessUserManagement: "User Management",
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
  canManageProjectTeam: "Manage Team",
  // Inventory Management
  canAccessInventoryManagement: "Inventory Management",
  canViewStock: "View Stock",
  canAddStockEntry: "Add Stock",
  canRequestStock: "Request Stock",
  canViewStockRequests: "View Requests",
  canApproveStockRequests: "Approve Requests",
  canDispatchStock: "Dispatches",
  canConfirmDelivery: "View Delivery",
  canViewAlerts: "View Alerts",
  canViewReports: "View Reports"
};

const BASE_URL = "https://my-app-1-uzea.onrender.com/api/users";

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

  // Fetch all users to populate the dropdown
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
          label: `${u.name} (${u.role}) - ${u.email}`
        }));
        setAllUsers(options);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchAllUsers();
  }, []);

  // When selectedUsers changes, load the permissions for the first selected user
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

  const togglePermission = (perm) => {
    setUpdatedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  // When saving, update permissions for all selected users
  const handleSave = async () => {
    try {
      for (const option of selectedUsers) {
        const uid = option.value;
        const res = await fetch(`${BASE_URL}/${uid}/permissions`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissions: updatedPermissions })
        });
        if (!res.ok) throw new Error(`Failed to update permissions for user ${uid}`);
      }
      alert("Permissions updated successfully! Changes will take effect next time the user(s) log in.");
    } catch (error) {
      console.error("Error updating permissions:", error);
      alert("Failed to update permissions.");
    }
  };

  if (currentUser.role !== "Administrator") {
    return <div>Access denied. Only administrators can update permissions.</div>;
  }

  // Container styling for dark/light mode
  const containerStyle = {
    backgroundColor: darkMode ? "#1a202c" : "#ffffff",
    borderColor: darkMode ? "#4a5568" : "#e2e8f0",
    color: darkMode ? "#ffffff" : "#1a202c"
  };

  // Chip styling for permissions
  const getChipClasses = (perm) => {
    const enabled = updatedPermissions.includes(perm);
    return `cursor-pointer px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
      enabled ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-900 hover:bg-gray-400"
    }`;
  };

  // All permission groups expanded by default
  const [openGroups, setOpenGroups] = useState(() => {
    const init = {};
    Object.keys(PERMISSIONS_GROUPS).forEach((group) => {
      init[group] = true;
    });
    return init;
  });

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  return (
    <div style={containerStyle} className="p-4 rounded-xl shadow-md border">
      {/* Removed the heading "Edit Permissions for ..." as requested */}

      {/* Multi-select dropdown using react-select */}
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
              color: darkMode ? "#ffffff" : "#1a202c"
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: darkMode ? "#2d3748" : "#ffffff"
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
              color: darkMode ? "#ffffff" : "#1a202c"
            }),
            dropdownIndicator: (provided) => ({
              ...provided,
              color: darkMode ? "#ffffff" : "#1a202c",
              transition: "color 0.2s ease",
              ":hover": {
                color: "#4299e1"
              }
            }),
            multiValue: (provided) => ({
              ...provided,
              backgroundColor: darkMode ? "#4a5568" : "#e2e8f0"
            }),
            multiValueLabel: (provided) => ({
              ...provided,
              color: darkMode ? "#ffffff" : "#1a202c"
            }),
            multiValueRemove: (provided) => ({
              ...provided,
              color: darkMode ? "#ffffff" : "#1a202c",
              ":hover": {
                background: "linear-gradient(90deg, #e53e3e, #c53030)",
                color: "#ffffff"
              }
            }),
            singleValue: (provided) => ({
              ...provided,
              color: darkMode ? "#ffffff" : "#1a202c"
            })
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
                      className={getChipClasses(perm)}
                      onClick={() => togglePermission(perm)}
                      title={perm} // Tooltip shows original permission key.
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
  );
};

export default UserPermissionsEditor;
