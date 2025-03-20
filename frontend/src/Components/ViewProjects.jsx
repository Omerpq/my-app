import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaEnvelope,
} from "react-icons/fa";
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

// Helper to extract initials from a full name string
const getInitials = (fullName) => {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
};

// Helper to get the first letter of the company name
const getCompanyLetter = (company_id, companies) => {
  if (!company_id) return "";
  const comp = companies.find((c) => c.id.toString() === company_id.toString());
  return comp && comp.name ? comp.name.charAt(0).toUpperCase() : "";
};

// Helper to get user initials by id (for Site Worker and manager lookup)
const getUserInitialsById = (id, users) => {
  if (!id) return "";
  const u = users.find((user) => user.id.toString() === id.toString());
  return u && u.name ? getInitials(u.name) : "";
};

const ViewProjects = () => {
  const { darkMode } = useTheme();
  const baseUrl = process.env.VITE_BACKEND_URL || "https://my-app-1-uzea.onrender.com";
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const navigate = useNavigate();

  // Drawer state
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentForms, setCurrentForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [selectedFormIds, setSelectedFormIds] = useState([]);
  const [isEmailMode, setIsEmailMode] = useState(false);

  // Refs for syncing horizontal scroll
  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);
  const [dummyWidth, setDummyWidth] = useState("0px");

  // -------------------------
  // Fetch all projects
  // -------------------------
  useEffect(() => {
    fetch(`${baseUrl}/api/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error fetching projects:", err));
  }, [baseUrl]);

  // -------------------------
  // Fetch companies
  // -------------------------
  useEffect(() => {
    fetch(`${baseUrl}/api/projects/companies`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCompanies(data);
        } else {
          console.error("Error fetching companies:", data.error || data);
          setCompanies([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching companies:", err);
        setCompanies([]);
      });
  }, [baseUrl]);

  // -------------------------
  // Fetch users
  // -------------------------
  useEffect(() => {
    fetch(`${baseUrl}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, [baseUrl]);

  // Adjust dummyWidth on load
  useEffect(() => {
    if (tableScrollRef.current) {
      setDummyWidth(`${tableScrollRef.current.scrollWidth}px`);
    }
  }, [projects]);

  // Adjust dummyWidth on resize
  useEffect(() => {
    const handleResize = () => {
      if (tableScrollRef.current) {
        setDummyWidth(`${tableScrollRef.current.scrollWidth}px`);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -------------------------
  // Filtering & Sorting
  // -------------------------
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
        <span className={`font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>↑</span>
      ) : (
        <span className={`font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>↓</span>
      );
    }
    return <span className={`${darkMode ? "text-blue-400" : "text-blue-500"}`}>↕</span>;
  };

  // -------------------------
  // Handlers
  // -------------------------
  const handleViewDetails = (jobId) => {
    navigate(`/projects/${jobId}/summary`);
  };

  const handleEdit = (projectId) => {
    console.log("Edit project", projectId);
  };

  const handleDelete = (projectId) => {
    console.log("Delete project", projectId);
  };

  const handleAddForm = async (project) => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setCurrentProject(project);
      setIsEmailMode(false);
      const res = await fetch(`${baseUrl}/api/projects/forms/${project.job_id}`);
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      const formsData = await res.json();
      setCurrentForms(formsData);
      setShowFormModal(true);
      setSelectedFormId("");
    } catch (error) {
      console.error("Error fetching forms for project:", error);
    }
  };

  const handleEmailForms = async (project) => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setCurrentProject(project);
      setIsEmailMode(true);
      const res = await fetch(`${baseUrl}/api/projects/forms/${project.job_id}`);
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      const formsData = await res.json();
      setCurrentForms(formsData);
      setShowFormModal(true);
      setSelectedFormIds([]);
    } catch (error) {
      console.error("Error fetching forms for project:", error);
    }
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setCurrentProject(null);
    setCurrentForms([]);
    setIsEmailMode(false);
    setSelectedFormIds([]);
  };

  const handleSelectForm = (e) => {
    setSelectedFormId(e.target.value);
  };

  const handleGoToForm = () => {
    if (!selectedFormId) return;
    closeFormModal();
  };

  const handleSendEmail = () => {
    if (selectedFormIds.length === 0) {
      alert("Please select at least one form to email.");
      return;
    }
    console.log("Sending email for project", currentProject.job_id, "with forms", selectedFormIds);
    alert("Email sent successfully!");
    closeFormModal();
  };

  // Sync horizontal scroll
  const syncScroll = (source) => {
    if (source === "top" && topScrollRef.current && tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    } else if (source === "table" && topScrollRef.current && tableScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div
      className={`max-w-7xl mx-auto p-8 rounded-xl transition-all duration-500 transform ${
        darkMode
          ? "bg-gray-800 text-white shadow-lg border border-gray-700"
          : "bg-white text-gray-900 shadow-2xl border border-gray-200"
      }`}
    >
      <h1 className="text-3xl font-bold text-center mb-6">View Projects</h1>

      {/* Search Input */}
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
            darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
          }`}
        />
      </div>

      {/* Top scrollbar */}
      <div
        className={`overflow-x-auto mb-2 ${darkMode ? "custom-scrollbar-dark" : "custom-scrollbar-light"}`}
        ref={topScrollRef}
        onScroll={() => syncScroll("top")}
      >
        <div style={{ width: dummyWidth, height: "1px" }}></div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto" ref={tableScrollRef} onScroll={() => syncScroll("table")}>
        <table className="w-full table-auto divide-y divide-gray-200">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <tr>
              {/* Company column */}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Company
              </th>
              {/* Customer column */}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Customer
              </th>
              {/* Job ID */}
              <th
                onClick={() => handleSort("job_id")}
                className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                style={{ width: "70px" }}
              >
                Job ID {getSortIcon("job_id")}
              </th>
              {/* Quotation */}
              <th
                onClick={() => handleSort("quotation_number")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Quotation {getSortIcon("quotation_number")}
              </th>
              {/* Address */}
              <th
                onClick={() => handleSort("address")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Address {getSortIcon("address")}
              </th>
              {/* Manager column: show initials from manager_name or fallback lookup */}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Manager
              </th>
              {/* Duty Staff */}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Duty Staff
              </th>
              {/* Site Worker */}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Site Worker
              </th>
              {/* Hours */}
              <th
                onClick={() => handleSort("hours_required")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Hours {getSortIcon("hours_required")}
              </th>
              {/* Start Date */}
              <th
                onClick={() => handleSort("start_date")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                Start Date {getSortIcon("start_date")}
              </th>
              {/* End Date */}
              <th
                onClick={() => handleSort("end_date")}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                End Date {getSortIcon("end_date")}
              </th>
              {/* Status */}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              {/* Key Code */}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                Key Code
              </th>
              {/* Actions */}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedProjects.length > 0 ? (
              sortedProjects.map((project) => (
                <tr key={project.id}>
                  {/* Company: first letter */}
                  <td className="px-4 py-3 text-xs break-words">
                    {getCompanyLetter(project.company_id, companies)}
                  </td>
                  {/* Customer: initials */}
                  <td className="px-4 py-3 text-xs break-words">
                    {project.customer_name ? getInitials(project.customer_name) : ""}
                  </td>
                  <td className="px-2 py-3 text-xs break-words">{project.job_id}</td>
                  <td className="px-4 py-3 text-xs break-words">{project.quotation_number}</td>
                  <td className="px-4 py-3 text-xs break-words">{project.address}</td>
                  {/* Manager: use manager_name if available, else look up via manager_id */}
                  <td className="px-4 py-3 text-xs break-words">
                    {project.manager_name
                      ? getInitials(project.manager_name)
                      : (() => {
                          const m = users.find(
                            (u) => u.id.toString() === project.manager_id.toString()
                          );
                          return m && m.name ? getInitials(m.name) : "";
                        })()}
                  </td>
                  {/* Duty Staff: initials */}
                  <td className="px-4 py-3 text-xs break-words">
                    {project.duty_staff ? getInitials(project.duty_staff) : ""}
                  </td>
                  {/* Site Worker: initials */}
                  <td className="px-4 py-3 text-xs break-words">
                    {getUserInitialsById(project.site_worker_id, users)}
                  </td>
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
                        onClick={() => handleViewDetails(project.job_id)}
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
                      <button
                        onClick={() => handleEmailForms(project)}
                        title="Email Forms"
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <FaEnvelope />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="14" className="px-4 py-3 text-center text-xs">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over Drawer for Form Selection / Emailing */}
      {showFormModal && currentProject && (
        <div className="fixed inset-0 z-50 pointer-events-auto">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 cursor-pointer"
            onClick={closeFormModal}
          />
          <div
            className={`absolute top-0 right-0 w-80 p-4 shadow-xl rounded-lg transform transition-transform ease-out duration-300 ${
              darkMode
                ? "backdrop-blur-sm bg-gray-800 bg-opacity-60 text-white"
                : "bg-white text-gray-900"
            }`}
            style={{
              border: darkMode
                ? "1px solid rgba(255,255,255,0.2)"
                : "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">
                {isEmailMode
                  ? `Email Forms for Project ${currentProject.job_id}`
                  : `Forms for Project ${currentProject.job_id}`}
              </h2>
              <button
                onClick={closeFormModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            {isEmailMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-1">
                  {ALL_FORMS.map((formDef) => {
                    const isFilled = currentForms.some(
                      (f) =>
                        (f.form_type || "").trim().toLowerCase() === formDef.id
                    );
                    const isSelected = selectedFormIds.includes(formDef.id);
                    return (
                      <div
                        key={formDef.id}
                        onClick={() => {
                          if (!isFilled) return;
                          if (isSelected) {
                            setSelectedFormIds(
                              selectedFormIds.filter((id) => id !== formDef.id)
                            );
                          } else {
                            setSelectedFormIds([...selectedFormIds, formDef.id]);
                          }
                        }}
                        className={`relative border-2 rounded-md transition-transform duration-200 flex items-center justify-center
                          ${
                            isFilled
                              ? isSelected
                                ? `${formColors[formDef.id]} border-none shadow-xl scale-105`
                                : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-400 border-transparent hover:border-gray-400"
                              : "bg-gray-200 text-gray-400 dark:bg-gray-600 dark:text-gray-500 opacity-50 cursor-not-allowed pointer-events-none"
                          }
                        `}
                        style={{ width: "5.6rem", height: "2rem" }}
                      >
                        <span className="text-[10px] font-bold text-center break-words">
                          {formDef.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleSendEmail}
                  className="w-full py-2 px-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded shadow-sm text-xs"
                >
                  Send Email
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {ALL_FORMS.map((formDef) => {
                  const isFilled = currentForms.some(
                    (f) =>
                      (f.form_type || "").trim().toLowerCase() === formDef.id
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProjects;
