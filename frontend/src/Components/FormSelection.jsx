// src/Components/FormSelection.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const FormSelection = () => {
  const { darkMode } = useTheme();
  const { projectId } = useParams();
  const navigate = useNavigate();

  // We fetch the project so we can display job_id instead of numeric ID
  const [project, setProject] = useState(null);

  // Example forms from your BRD or actual data
  const forms = [
    { id: "bt-form", name: "BT Form", available: true },
    { id: "quotation-form", name: "Quotation Form", available: false },
    { id: "starting-form", name: "Starting Form", available: false },
    { id: "measuring-form", name: "Measuring Form", available: false },
    { id: "key-handover-form", name: "Key Handover Form", available: false },
  ];

  // Minimal fetch to get the project
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL;
    fetch(`${baseUrl}/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => setProject(data))
      .catch((err) => console.error("Error fetching project:", err));
  }, [projectId]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h2 className="text-2xl font-bold mb-6">
        {/* If project not yet fetched, fallback to "Loading..."; else show job_id */}
        Select a Form for Project {project ? project.job_id : "Loading..."}
      </h2>

      <div
        className={`w-full max-w-md p-6 rounded-lg shadow-xl ${
          darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
        }`}
      >
        {forms.map((form) => (
          <button
            key={form.id}
            onClick={() => {
              if (!form.available) {
                alert(`${form.name} is not available yet.`);
                return;
              }
              // Navigate to the chosen form route
              navigate(`/projects/${projectId}/forms/${form.id}`);
            }}
            disabled={!form.available}
            className={`block w-full py-3 my-2 rounded-lg text-lg font-semibold transition-all duration-300 ${
              form.available
                ? darkMode
                  ? "bg-green-700 hover:bg-green-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-300 text-gray-700 cursor-not-allowed"
            }`}
          >
            {form.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FormSelection;
