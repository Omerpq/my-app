// AdminKpiAssignments.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";

function AdminKpiAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    const url = "http://localhost:5000/api/admin/kpis/assignments";
    const headers = {
      "Content-Type": "application/json",
      Authorization: user?.token ? `Bearer ${user.token}` : "",
    };

    try {
      console.log("DEBUG: Calling fetchAssignments with URL =", url);
      console.log("DEBUG: Using headers =", headers);

      const res = await fetch(url, { headers });
      console.log("DEBUG: fetchAssignments response status =", res.status);

      if (!res.ok) {
        // Try to read the body for more details
        const text = await res.text();
        console.log("DEBUG: fetchAssignments error body =", text);
        throw new Error(`Failed to fetch assignments (status: ${res.status})`);
      }

      const data = await res.json();
      console.log("DEBUG: fetchAssignments success data =", data);
      setAssignments(data);
    } catch (err) {
      console.error("DEBUG: fetchAssignments caught error =", err);
      setError(err.message);
    }
  }

  async function handleToggle(role, kpi_key, currentEnabled) {
    const url = "https://my-app-1-uzea.onrender.com/api/admin/kpis/assignments";
    const headers = {
      "Content-Type": "application/json",
      Authorization: user?.token ? `Bearer ${user.token}` : "",
    };

    try {
      console.log("DEBUG: handleToggle calling =", url);
      console.log("DEBUG: handleToggle body =", { role, kpi_key, is_enabled: !currentEnabled });

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          role,
          kpi_key,
          is_enabled: !currentEnabled,
        }),
      });
      console.log("DEBUG: handleToggle response status =", res.status);

      if (!res.ok) {
        const text = await res.text();
        console.log("DEBUG: handleToggle error body =", text);
        throw new Error(`Failed to update assignment (status: ${res.status})`);
      }

      await fetchAssignments(); // Refresh
    } catch (err) {
      console.error("DEBUG: handleToggle caught error =", err);
      setError(err.message);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage KPI Assignments</h2>
      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Role</th>
            <th className="px-4 py-2 border">KPI Key</th>
            <th className="px-4 py-2 border">Enabled</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map(({ role, kpi_key, is_enabled }) => (
            <tr key={`${role}-${kpi_key}`}>
              <td className="border px-4 py-2">{role}</td>
              <td className="border px-4 py-2">{kpi_key}</td>
              <td className="border px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={is_enabled}
                  onChange={() => handleToggle(role, kpi_key, is_enabled)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminKpiAssignments;
