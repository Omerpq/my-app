// src/UserPermissionsManager.jsx
import React, { useState, useEffect } from "react";
import { getUsers } from "./api";
import UserPermissionsEditor from "./UserPermissionsEditor";
import { useTheme } from "./context/ThemeContext";

const UserPermissionsManager = () => {
  const { darkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchAllUsers();
  }, []);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen p-6`}>
      <h1 className="text-2xl font-bold mb-4">Manage User Permissions</h1>
      <div className="mb-6">
        <label className="block font-semibold mb-2">Select a user:</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className={`w-full p-2 border rounded ${
            darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
          }`}
        >
          <option value="">-- Select a user --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>
      {selectedUserId && (
        <div>
          <UserPermissionsEditor userId={selectedUserId} />
        </div>
      )}
    </div>
  );
};

export default UserPermissionsManager;
