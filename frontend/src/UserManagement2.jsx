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

// Define initial state for the new user form
const initialNewUser = {
  name: "",
  email: "",
  role: "",
  status: "",
  password: "12345678",
};

// SortArrow component
const SortArrow = ({ direction }) =>
  direction === "asc" ? (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 15 12 9 18 15" />
      <line x1="6" y1="18" x2="18" y2="18" />
    </svg>
  ) : (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
      <line x1="6" y1="6" x2="18" y2="6" />
    </svg>
  );

// Reusable Dark Mode Toggle
const DarkModeToggleWrapper = () => {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <div className="flex items-center">
      <label className="flex items-center cursor-pointer">
        <span className="mr-2 font-semibold text-gray-300">Dark Mode</span>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={darkMode}
            onChange={toggleTheme}
          />
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

  // Search and sort states for the grid.
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const toggleSortDirection = () =>
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      setSelectedUsers([]); // Reset selection when list updates.
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
    const userToDelete = users.find((user) => user.id === id);
    if (userToDelete?.role === "Administrator") {
      const adminCount = users.filter((user) => user.role === "Administrator").length;
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
      const allIds = users.map((user) => user.id);
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
    let aValue = a[sortOption];
    let bValue = b[sortOption];
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const isCreateDisabled = !(newUser.name && newUser.email && newUser.role && newUser.status);

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {/* Header */}
      <header className={`flex justify-between items-center p-6 shadow-lg border ${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border border-gray-200"}`}>
        <div className="text-xl font-semibold">User Management</div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className={`text-sm ${darkMode ? "text-yellow-600" : "text-gray-500"}`}>{currentUser.role}</span>
            <span className="text-xs">{currentUser.name}</span>
          </div>
          <DarkModeToggleWrapper />
        </div>
      </header>

      {error && <p className="text-red-500 p-4">{error}</p>}

      {/* Toolbar */}
      {currentUser?.role === "Administrator" && (
        <div className="w-full p-4 mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              if (!isSubmitting) {
                setShowAddForm(!showAddForm);
              }
            }}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg transition-all duration-500 ${isSubmitting ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-[#ff9933] text-white hover:bg-green-600"}`}
          >
            {showAddForm ? "Back" : "Add user"}
          </button>
          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg transition-all duration-500 ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#ff9933] hover:bg-[#ff8800] text-white"}`}
            >
              Delete selected ({selectedUsers.length})
            </button>
          )}
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && currentUser?.role === "Administrator" && (
        <form
          onSubmit={handleAddUser}
          className={`mx-auto p-6 mt-6 rounded-xl transition-all duration-500 transform shadow-2xl border ${
            darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 border border-gray-200"
          }`}
        >
          <h2 className="text-2xl font-semibold text-center mb-4">Create new user</h2>
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
              <option value="InventoryManager">Inventor Manager</option>
              <option value="SiteWorker">Site Worker</option>
              <option value="Driver">Driver</option>
            </select>
          </div>
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
            className={`w-full py-2 mt-6 text-white rounded-lg shadow-md transition-all duration-500 ${
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
              <p className="text-left text-blue-500 cursor-pointer" onClick={() => {
                setInfoMessage("");
                setNewUser(initialNewUser);
                setFormLocked(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}>
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
      )}

      {/* Users Table */}
      <section
        className={`w-full p-4 mt-6 rounded-xl transition-all duration-500 transform shadow-2xl border ${
          darkMode
            ? "bg-gray-800 text-white border-gray-700"
            : "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 border border-gray-200"
        }`}
      >
        {/* Toolbar for search & sort */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <label className="mr-2 font-semibold">Search:</label>
            <input
              type="text"
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-48 px-4 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300 shadow-inner"
              } focus:border-blue-500`}
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className={`px-4 py-1 border rounded-lg focus:outline-none transition-all duration-500 w-32 ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300 shadow-inner"
              } focus:border-blue-500`}
            >
              <option value="name">Name</option>
              <option value="role">Role</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={toggleSortDirection}
              className="px-2 py-1 focus:outline-none"
              title="Toggle sort direction"
            >
              <SortArrow direction={sortDirection} />
            </button>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedUsers.length === users.length && users.length > 0}
                  />
                </th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
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
                  <tr key={user.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 break-words">
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
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
                            darkMode
                              ? "bg-gray-700 text-white border-gray-600"
                              : "bg-white text-gray-900 border-gray-300 shadow-inner"
                          } focus:border-blue-500`}
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td className="px-4 py-2 break-words">
                      {editingUserId === user.id ? (
                        <input
                          type="email"
                          name="email"
                          value={editingUserData.email}
                          onChange={handleEditChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
                            darkMode
                              ? "bg-gray-700 text-white border-gray-600"
                              : "bg-white text-gray-900 border-gray-300 shadow-inner"
                          } focus:border-blue-500`}
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-4 py-2 break-words">
                      {editingUserId === user.id ? (
                        <select
                          name="role"
                          value={editingUserData.role}
                          onChange={handleEditChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-all duration-500 ${
                            darkMode
                              ? "bg-gray-700 text-white border-gray-600"
                              : "bg-white text-gray-900 border-gray-300 shadow-inner"
                          } focus:border-blue-500`}
                        >
                          <option value="">Select role</option>
                          <option value="Administrator">Administrator</option>
                          <option value="InventoryManager">Inventor Manager</option>
                          <option value="SiteWorker">Site Worker</option>
                          <option value="Driver">Driver</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td className="px-4 py-2 break-words">
                      {editingUserId === user.id ? (
                        <select
                          name="status"
                          value={editingUserData.status}
                          onChange={handleEditChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-all duration-500 ${
                            darkMode
                              ? "bg-gray-700 text-white border-gray-600"
                              : "bg-white text-gray-900 border-gray-300 shadow-inner"
                          } focus:border-blue-500`}
                        >
                          <option value="">Select status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        user.status
                      )}
                    </td>
                    <td className="px-4 py-2 break-words">
                      {currentUser?.role === "Administrator" && (
                        <div className="flex space-x-2">
                          {editingUserId === user.id ? (
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
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(user)}
                                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-500"
                              >
                                Edit
                              </button>
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
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UserManagement;
