// src/api.js
const API_BASE = "https://my-app-1-uzea.onrender.com";
// Actual implementation –
export const getUsers = async () => {
  const response = await fetch(`${API_BASE}/api/users`); // Still using /api for users
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return await response.json();
};

// ----- User Management API Functions -----
export const createUser = async (userData) => {
  const response = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create user");
  }
  return await response.json();
};

export const updateUser = async (id, updatedData) => {
  if (!id) {
    throw new Error("Invalid user ID");
  }
  const response = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) {
    throw new Error("Failed to update user");
  }
  return await response.json();
};

export const deleteUser = async (id) => {
  const response = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
  return await response.json();
};

// ----- Send Account Info Email -----
export const sendUserInfoEmail = async (email) => {
  const response = await fetch(`${API_BASE}/api/auth/send-account-info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    throw new Error("Failed to send account info email");
  }
  return await response.json();
};

// ----- Dashboard Stats API Function -----
// Minimal change: Now fetches from the production endpoint for projects (without /api)
export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE}/projects/dashboard`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  return await response.json();
};

// ----- Project API Functions -----
export const getProjects = async () => {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  return await response.json();
};

export const getProjectById = async (id) => {
  const response = await fetch(`${API_BASE}/projects/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }
  return await response.json();
};

export const createProject = async (project) => {
  const response = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    throw new Error("Failed to create project");
  }
  return await response.json();
};

export const updateProject = async (id, updatedProject) => {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedProject),
  });
  if (!response.ok) {
    throw new Error("Failed to update project");
  }
  return await response.json();
};

export const deleteProject = async (id) => {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete project");
  }
  return await response.json();
};
