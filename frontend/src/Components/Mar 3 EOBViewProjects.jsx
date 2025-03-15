// src/Components/ViewProjects.jsx
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { FaEye, FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ALL_FORMS = [
  { id: "bt-form", name: "BT Form" },
  { id: "quotation-form", name: "Quotation Form" },
  { id: "starting-form", name: "Starting Form" },
  { id: "measuring-form", name: "Measuring Form" },
  { id: "key-handover-form", name: "Key Handover Form" },
];

const formColors = {
  "bt-form": "bg-indigo-500 hover:bg-indigo-600",
  "quotation-form": "bg-green-500 hover:bg-green-600",
  "starting-form": "bg-yellow-500 hover:bg-yellow-600",
  "measuring-form": "bg-blue-500 hover:bg-blue-600",
  "key-handover-form": "bg-red-500 hover:bg-red-600",
};

const ViewProjects = () => {
  const { darkMode } = useTheme();
  const baseUrl = process.env.VITE_BACKEND_URL;
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const navigate = useNavigate();

  const [showFormModal, setShowFormModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentForms, setCurrentForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");

  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);
  const [dummyWidth, setDummyWidth] = useState("0px");

  useEffect(() => {
    fetch(`${baseUrl}/api/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error fetching projects:", err));
  }, [baseUrl]);

  useEffect(() => {
    if (tableScrollRef.current) {
      setDummyWidth(`${tableScrollRef.current.scrollWidth}px`);
    }
  }, [projects]);

  useEffect(() => {
    const handleResize = () => {
      if (tableScrollRef.current) {
        setDummyWidth(`${tableScrollRef.current.scrollWidth}px`);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredProjects = projects.filter((proj) => {
    const term = searchTerm.toLowerCase();
    return (
      (proj.job_id && proj.job_id.toLowerCase().includes(term)) ||
      (proj.quotation_number && proj.quotation_number.toLowerCase().includes(term)) ||
      (proj.address && proj.address.toLowerCase().includes(term))
    );
  });

  const sortedProjects = sortField
    ? [...filteredProjects].sort((a, b) => {
        let aVal = a[sortField] || "";
        let bVal = b[sortField] || "";
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      })
    : filteredProjects;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === "asc" ? (
        <span className={`font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
          ↑
        </span>
      ) : (
        <span className={`font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
          ↓
        </span>
      );
    }
    return <span className={`${darkMode ? "text-blue-400" : "text-blue-500"}`}>↕</span>;
  };

  const handleViewDetails = (projectId) => {
    console.log("View details of project", projectId);
  };
  const handleEdit = (projectId) => {
    console.log("Edit project", projectId);
  };
  const handleDelete = (projectId) => {
    console.log("Delete project", projectId);
  };

  const handleAddForm = async (project) => {
    try {
      console.log("Fetching forms for job_id:", project.job_id);
      setCurrentProject(project);

      const res = await fetch(`${baseUrl}/api/projects/forms/${project.job_id}`);
      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const formsData = await res.json();
      console.log("Fetched forms:", formsData);

      setCurrentForms(formsData);
      setShowFormModal(true);
      setSelectedFormId("");
    } catch (error) {
      console.error("Error fetching forms for project:", error);
    }
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setCurrentProject(null);
    setCurrentForms([]);
  };

  const handleSelectForm = (e) => {
    setSelectedFormId(e.target.value);
  };

  const handleGoToForm = () => {
    if (!selectedFormId) return;
    closeFormModal();
  };

  const syncScroll = (source) => {
    if (source === "top" && topScrollRef.current && tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    } else if (source === "table" && topScrollRef.current && tableScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  return (
    <div
      className={`max-w-7xl mx-auto p-8 rounded-xl transition-all duration-500 transform ${
        darkMode
          ? "bg-gray-800 text-white shadow-lg border border-gray-700"
          : "bg-white text-gray-900 shadow-2xl border border-gray-200"
      }`}
    >
      <h1 className="text-3xl font-bold text-center mb-6">View Projects</h1>

      <div className="mb-4 flex items-center">
        <label className="text-xs font-medium uppercase tracking-wider mr-2">
          Search:
        </label>
        <input
          type="text"
          placeholder="Search by Job ID, Quotation, or Address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-48 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
            darkMode
              ? "bg-gray-700 text-white border-gray-600"
              : "bg-white text-gray-900 border-gray-300"
          }`}
        />
      </div>

      <div
        className={`overflow-x-auto mb-2 ${
          darkMode ? "custom-scrollbar-dark" : "custom-scrollbar-light"
        }`}
        ref={topScrollRef}
        onScroll={() => syncScroll("top")}
      >
        <div style={{ width: dummyWidth, height: "1px" }}></div>
      </div>

      <div
        className="overflow-x-auto"
        ref={tableScrollRef}
        onScroll={() => syncScroll("table")}
      >
        <table className="w-full table-auto divide-y divide-gray-200">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <tr>
              <th
                onClick={() => handleSort("job_id")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Job ID {getSortIcon("job_id")}
              </th>
              <th
                onClick={() => handleSort("quotation_number")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Quotation {getSortIcon("quotation_number")}
              </th>
              <th
                onClick={() => handleSort("address")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Address {getSortIcon("address")}
              </th>
              <th
                onClick={() => handleSort("manager_id")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Manager ID {getSortIcon("manager_id")}
              </th>
              <th
                onClick={() => handleSort("duty_staff")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Duty Staff {getSortIcon("duty_staff")}
              </th>
              <th
                onClick={() => handleSort("hours_required")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Hours {getSortIcon("hours_required")}
              </th>
              <th
                onClick={() => handleSort("start_date")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Start Date {getSortIcon("start_date")}
              </th>
              <th
                onClick={() => handleSort("end_date")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                End Date {getSortIcon("end_date")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                Key Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedProjects.length > 0 ? (
              sortedProjects.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-3 text-xs break-words">{project.job_id}</td>
                  <td className="px-4 py-3 text-xs break-words">{project.quotation_number}</td>
                  <td className="px-4 py-3 text-xs break-words">{project.address}</td>
                  <td className="px-4 py-3 text-xs break-words">{project.manager_id}</td>
                  <td className="px-4 py-3 text-xs break-words">{project.duty_staff}</td>
                  <td className="px-4 py-3 text-xs break-words">{project.hours_required}</td>
                  <td className="px-4 py-3 text-xs break-words">
                    {new Date(project.start_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs break-words">
                    {new Date(project.end_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs break-words">{project.status}</td>
                  <td className="px-4 py-3 text-xs break-words">{project.key_code}</td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(project.id)}
                        title="View Details"
                        className="text-yellow-500 hover:text-yellow-700"
                      >
                        <FaEye />
                      </button>
                      <button onClick={() => handleEdit(project.id)} title="Edit">
                        <FaEdit className="text-blue-600 hover:text-blue-800" />
                      </button>
                      <button onClick={() => handleDelete(project.id)} title="Delete">
                        <FaTrashAlt className="text-red-600 hover:text-red-800" />
                      </button>
                      <button
                        onClick={() => handleAddForm(project)}
                        title="Add Form"
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="px-4 py-3 text-center text-xs">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over Drawer for Form Selection */}
      {showFormModal && currentProject && (
        <div className="fixed inset-0 z-50 flex items-start">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeFormModal} />
          {/* Drawer Content */}
          <div
            className={`
              relative w-80 p-4 shadow-xl rounded-lg transform transition-transform ease-out duration-300
              ${darkMode ? "backdrop-blur-sm bg-gray-800 bg-opacity-60 text-white" : "bg-white text-gray-900"}
            `}
            style={{
              marginLeft: "auto",
              border: darkMode
                ? "1px solid rgba(255,255,255,0.2)"
                : "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                Forms for Project {currentProject.job_id}
              </h2>
              <button
                onClick={closeFormModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {ALL_FORMS.map((formDef) => {
                const isFilled = currentForms.some(
                  (f) => f.form_type === formDef.id
                );
                return (
                  <div key={formDef.id} className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{formDef.name}</span>
                    <button
                      onClick={() =>
                        navigate(`/projects/${currentProject.job_id}/forms/${formDef.id}`)
                      }
                      className={`px-3 py-1 ${formColors[formDef.id]} text-white rounded text-sm`}
                    >
                      {isFilled ? "Edit" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProjects;
