// src/UserManagement.jsx
import React, { useEffect, useState } from "react";
import { useTheme } from "./context/ThemeContext";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  sendUserInfoEmail,
} from "./api";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import UserPermissionsEditor from "./UserPermissionsEditor";

const initialNewUser = {
  name: "",
  email: "",
  role: "",
  status: "",
  password: "12345678",
};

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

const UserManagement = () => {
  const { darkMode } = useTheme();
  const { user: currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Granular permissions
  const canView = currentUser.permissions?.includes("canViewUsers");
  const canCreate = currentUser.permissions?.includes("canCreateUser");
  const canEdit = currentUser.permissions?.includes("canEditUser");
  const canDelete = currentUser.permissions?.includes("canDeleteUser");

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [newUser, setNewUser] = useState(initialNewUser);
  const [formLocked, setFormLocked] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserData, setEditingUserData] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortOption === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortOption(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortOption === field) {
      return sortDirection === "asc" ? (
        <span className={`ml-1 font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>↑</span>
      ) : (
        <span className={`ml-1 font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>↓</span>
      );
    }
    return <span className={`ml-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>↕</span>;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      setSelectedUsers([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setInfoMessage("");
    setFormError("");
    setIsSubmitting(true);
    try {
      await createUser(newUser);
      await sendUserInfoEmail(newUser.email, { password: "12345678" });
      setInfoMessage("User account created. Email with login credentials has been sent.");
      setFormLocked(true);
      fetchUsers();
    } catch (err) {
      if (err.message.toLowerCase().includes("email already exists")) {
        setFormError("Email already exists");
      } else {
        setFormError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const userToDelete = users.find((u) => u.id === id);
    if (userToDelete?.role === "Administrator") {
      const adminCount = users.filter((u) => u.role === "Administrator").length;
      if (adminCount <= 1) {
        alert("At least one Administrator must be present. You cannot delete the last administrator.");
        return;
      }
    }
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm("Are you sure you want to delete the selected users?")) return;
    try {
      await Promise.all(selectedUsers.map((id) => deleteUser(id)));
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckboxChange = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((uid) => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = users.map((u) => u.id);
      setSelectedUsers(allIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditingUserData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  };

  const handleEditChange = (e) => {
    setEditingUserData({ ...editingUserData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    try {
      await updateUser(id, editingUserData);
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditCancel = () => {
    setEditingUserId(null);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortOption];
    const bValue = b[sortOption];
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const isCreateDisabled = !(newUser.name && newUser.email && newUser.role && newUser.status);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen transition-all duration-500`}>
      {/* Header */}
      <header className={`${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} flex justify-between items-center p-6 shadow-lg border`}>
        <div className="text-xl font-semibold">User Management</div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className={`${darkMode ? "text-yellow-600" : "text-gray-500"} text-sm`}>{currentUser.role}</span>
            <span className="text-xs">{currentUser.name}</span>
          </div>
          <DarkModeToggleWrapper />
        </div>
      </header>

      {/* Render User Permissions Editor for Administrators */}
      {currentUser.role === "Administrator" && (
        <div className="p-6">
          <UserPermissionsEditor userId={56} />
        </div>
      )}

      {/* Navigation for "Add User" button */}
      {canCreate && (
        <nav className="p-6">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex flex-wrap gap-4 relative">
            <button
              onClick={() => {
                if (!isSubmitting) {
                  setShowAddForm(!showAddForm);
                }
              }}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg transition-all duration-500 ${
                isSubmitting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-[#ff9933] text-white hover:bg-[#ff7700]"
              }`}
            >
              {showAddForm ? "Back" : "Add User"}
            </button>
            {selectedUsers.length > 0 && canDelete && (
              <button
                onClick={handleBulkDelete}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg transition-all duration-500 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#ff9933] hover:bg-[#ff8800] text-white"
                }`}
              >
                Delete selected ({selectedUsers.length})
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Main area */}
      {canView && (
        <main className="p-6 transition-all duration-500">
          {/* Create User Form Container */}
          {showAddForm && canCreate && (
            <div
              className="p-6 rounded-xl border transition-shadow duration-300 shadow-2xl mb-6 max-w-md mx-auto"
              style={{
                backgroundColor: darkMode ? "#1a202c" : "#f7fafc",
                borderColor: darkMode ? "#4a5568" : "#e2e8f0",
              }}
            >
              <form onSubmit={handleAddUser}>
                <h2 className="text-2xl font-semibold text-center mb-4">Create new user</h2>
                {/* Name Field */}
                <div className="mb-4">
                  <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                    disabled={isSubmitting || formLocked}
                    className={`w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
                      darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300 shadow-inner"
                    } focus:border-blue-500`}
                  />
                </div>
                {/* Email Field */}
                <div className="mb-4">
                  <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    disabled={isSubmitting || formLocked}
                    className={`w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
                      darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300 shadow-inner"
                    } focus:border-blue-500`}
                  />
                </div>
                {/* Role Field */}
                <div className="mb-4">
                  <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    required
                    disabled={isSubmitting || formLocked}
                    className={`w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none transition-all duration-500 ${
                      darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300 shadow-inner"
                    } focus:border-blue-500`}
                  >
                    <option value="">Select role</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Contractor">Contractor</option>
                    <option value="InventoryManager">Inventor Manager</option>
                    <option value="SiteWorker">Site Worker</option>
                    <option value="Driver">Driver</option>
                  </select>
                </div>
                {/* Status Field */}
                <div className="mb-4">
                  <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    required
                    disabled={isSubmitting || formLocked}
                    className={`w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none transition-all duration-500 ${
                      darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300 shadow-inner"
                    } focus:border-blue-500`}
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isCreateDisabled || isSubmitting || formLocked}
                  className={`w-full py-2 mt-4 text-white rounded-lg shadow-md transition-all duration-500 ${
                    isCreateDisabled || isSubmitting || formLocked
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 focus:bg-blue-600"
                  } focus:outline-none`}
                >
                  Create and send account info
                </button>
                {isSubmitting && (
                  <div className="flex items-center mt-2">
                    <svg className="animate-spin h-5 w-5 text-gray-600 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span className="text-gray-600">Processing...</span>
                  </div>
                )}
                {infoMessage && (
                  <div className="mt-2">
                    <p className="text-left text-green-500">{infoMessage}</p>
                    <p
                      className="text-left text-blue-500 cursor-pointer"
                      onClick={() => {
                        setInfoMessage("");
                        setNewUser(initialNewUser);
                        setFormLocked(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Add another user
                    </p>
                  </div>
                )}
                {formError && (
                  <div className="mt-2">
                    <p className="text-left text-red-700">{formError}</p>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* User Grid Container */}
          <div
            className="p-6 rounded-xl border transition-shadow duration-300 shadow-2xl max-w-4xl mx-auto"
            style={{
              backgroundColor: darkMode ? "#1a202c" : "#f7fafc",
              borderColor: darkMode ? "#4a5568" : "#e2e8f0",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr>
                    <th className={`px-4 py-2 text-left ${darkMode ? "text-white" : "text-gray-900"}`}>
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedUsers.length === users.length && users.length > 0}
                      />
                    </th>
                    <th onClick={() => handleSort("name")} className={`px-4 py-2 text-left cursor-pointer ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Name{getSortIcon("name")}
                    </th>
                    <th onClick={() => handleSort("email")} className={`px-4 py-2 text-left cursor-pointer ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Email{getSortIcon("email")}
                    </th>
                    <th onClick={() => handleSort("role")} className={`px-4 py-2 text-left cursor-pointer ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Role{getSortIcon("role")}
                    </th>
                    <th onClick={() => handleSort("status")} className={`px-4 py-2 text-left cursor-pointer ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Status{getSortIcon("status")}
                    </th>
                    <th className={`px-4 py-2 text-left ${darkMode ? "text-white" : "text-gray-900"}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center p-4">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    sortedUsers.map((user) => (
                      <tr key={user.id} className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                        <td className={`px-4 py-2 break-words ${darkMode ? "text-white" : "text-gray-900"}`}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleCheckboxChange(user.id)}
                          />
                        </td>
                        <td className="px-4 py-2 break-words">
                          {editingUserId === user.id ? (
                            <input
                              type="text"
                              name="name"
                              value={editingUserData.name}
                              onChange={handleEditChange}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 bg-white text-gray-900 border-gray-300 shadow-inner dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:border-blue-500"
                            />
                          ) : (
                            <span className={`${darkMode ? "text-white" : "text-gray-900"}`}>{user.name}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 break-words">
                          {editingUserId === user.id ? (
                            <input
                              type="email"
                              name="email"
                              value={editingUserData.email}
                              onChange={handleEditChange}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 bg-white text-gray-900 border-gray-300 shadow-inner dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:border-blue-500"
                            />
                          ) : (
                            <span className={`${darkMode ? "text-white" : "text-gray-900"}`}>{user.email}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 break-words">
                          {editingUserId === user.id ? (
                            <select
                              name="role"
                              value={editingUserData.role}
                              onChange={handleEditChange}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none transition-all duration-500 bg-white text-gray-900 border-gray-300 shadow-inner dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:border-blue-500"
                            >
                              <option value="">Select role</option>
                              <option value="Administrator">Administrator</option>
                              <option value="InventoryManager">Inventor Manager</option>
                              <option value="SiteWorker">Site Worker</option>
                              <option value="Driver">Driver</option>
                            </select>
                          ) : (
                            <span className={`${darkMode ? "text-white" : "text-gray-900"}`}>{user.role}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 break-words">
                          {editingUserId === user.id ? (
                            <select
                              name="status"
                              value={editingUserData.status}
                              onChange={handleEditChange}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none transition-all duration-500 bg-white text-gray-900 border-gray-300 shadow-inner dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:border-blue-500"
                            >
                              <option value="">Select status</option>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          ) : (
                            <span className={`${darkMode ? "text-white" : "text-gray-900"}`}>{user.status}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 break-words">
                          <div className="flex space-x-2">
                            {editingUserId === user.id ? (
                              <>
                                {canEdit && (
                                  <>
                                    <button
                                      onClick={() => handleEditSave(user.id)}
                                      className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-500"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={handleEditCancel}
                                      className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-all duration-500"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                {canEdit && (
                                  <button
                                    onClick={() => handleEditClick(user)}
                                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-500"
                                  >
                                    Edit
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={selectedUsers.length > 0}
                                    className={`px-4 py-2 rounded-lg transition-all duration-500 ${
                                      selectedUsers.length > 0
                                        ? "bg-red-300 text-red-200 cursor-not-allowed"
                                        : "bg-red-600 text-white hover:bg-red-700"
                                    }`}
                                  >
                                    Delete
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default UserManagement;
