import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

// Helper to format date/time for datetime-local inputs
const getLocalDateTimeString = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const CreateProject = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const baseUrl = process.env.VITE_BACKEND_URL || "https://my-app-1-uzea.onrender.com";  
  const now = getLocalDateTimeString();
  
  // Initial state for projectData
  const [projectData, setProjectData] = useState({
    job_id: "",
    quotation_number: "",
    floor: "",            // Floor field (mandatory)
    customer_name: "",    // Customer Name field (mandatory)
    address: "",
    manager_id: "",
    manager_name: "",
    duty_staff: "",
    site_worker_id: "",
    driver_id: "",
    company_id: "",
    hours_required: "",
    start_date: now,
    planned_end_date: "",
    key_code: "",
    status: "Planned",
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [companySaving, setCompanySaving] = useState(false);
  const [companyModalMode, setCompanyModalMode] = useState("add"); // "add" or "editDelete"
  const [editMode, setEditMode] = useState(false);
  const [newCompany, setNewCompany] = useState({
    id: null,
    name: "",
    address: "",
    contact_email: "",
    contact_phone: "",
  });
  
  useEffect(() => {
    fetch(`${baseUrl}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, [baseUrl]);
  
  useEffect(() => {
    fetch(`${baseUrl}/api/projects/companies`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCompanies(data);
        } else {
          console.error("Error from backend:", data.error || data);
          setCompanies([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching companies:", err);
        setCompanies([]);
      });
  }, [baseUrl]);
  
  const managers = users.filter((u) => u.role === "Manager");
  const drivers = users.filter((u) => u.role === "Driver");
  const dutyStaffUsers = users.filter(
    (u) => !["InventoryManager", "Administrator", "Manager", "Driver"].includes(u.role)
  );
  // NEW: Define siteWorkers for the Site Worker dropdown (ensure role in DB is "SiteWorker")
  const siteWorkers = users.filter((u) => u.role === "SiteWorker");
  
  // Handle selection of company chip
  const handleCompanySelect = (company) => {
    setProjectData((prev) => ({
      ...prev,
      company_id: company.id.toString(),
    }));
  };
  
  // Deletion of company
  const handleDeleteCompany = async (company) => {
    setCompanySaving(true);
    try {
      const res = await fetch(`${baseUrl}/api/projects/companies/${company.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete company");
      }
      setCompanies((prev) => prev.filter((c) => c.id !== company.id));
      if (projectData.company_id === company.id.toString()) {
        setProjectData((prev) => ({ ...prev, company_id: "" }));
      }
      setError("");
      setShowAddCompanyModal(false);
    } catch (err) {
      console.error("Error deleting company:", err);
      setError(err.message);
    } finally {
      setCompanySaving(false);
    }
  };
  
  const checkJobId = async () => {
    if (!projectData.job_id.trim()) return;
    try {
      const res = await fetch(`${baseUrl}/api/projects`);
      const projects = await res.json();
      const exists = projects.some(
        (proj) =>
          proj.job_id.toLowerCase() === projectData.job_id.trim().toLowerCase()
      );
      if (exists) {
        setError("Job ID already exists, please provide new Job ID");
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Error checking Job ID:", err);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "hours_required") {
      setProjectData((prev) => {
        const newData = { ...prev, [name]: value };
        const hours = parseFloat(value);
        if (newData.start_date && !isNaN(hours)) {
          const days = Math.ceil(hours / 9);
          const start = new Date(newData.start_date);
          start.setDate(start.getDate() + days);
          newData.planned_end_date = getLocalDateTimeString(start);
        }
        return newData;
      });
      setError("");
      return;
    }
    if (name === "start_date") {
      setProjectData((prev) => {
        const newData = { ...prev, start_date: value };
        const hours = parseFloat(newData.hours_required);
        if (newData.hours_required && !isNaN(hours)) {
          const days = Math.ceil(hours / 9);
          const start = new Date(value);
          start.setDate(start.getDate() + days);
          newData.planned_end_date = getLocalDateTimeString(start);
        }
        return newData;
      });
      return;
    }
    setProjectData((prev) => ({ ...prev, [name]: value }));
    if (name === "job_id") setError("");
  };
  
  // Update validation to include customer_name as mandatory and safely call toString()
  const isFormValid = () => {
    return (
      projectData.job_id.trim() &&
      projectData.quotation_number.trim() &&
      projectData.floor.trim() &&
      projectData.customer_name.trim() &&
      projectData.address.trim() &&
      (projectData.manager_id || "").toString().trim() &&
      projectData.manager_name.trim() &&
      projectData.duty_staff.trim() &&
      (projectData.site_worker_id || "").toString().trim() &&
      (projectData.driver_id || "").toString().trim() &&
      (projectData.hours_required || "").toString().trim() &&
      projectData.start_date.trim() &&
      projectData.planned_end_date.trim() &&
      projectData.key_code.trim()
    );
  };
  
  const [projectLoading, setProjectLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
  
    if (!projectData.company_id.trim()) {
      setError("Please select a company for the project.");
      return;
    }
  
    if (!isFormValid()) {
      setError("Please fill all the required fields.");
      return;
    }
  
    const dataToSubmit = {
      ...projectData,
      company_id: parseInt(projectData.company_id, 10),
      floor: Number(projectData.floor),
      customer_name: projectData.customer_name.trim(),
      site_worker_id: parseInt(projectData.site_worker_id, 10),
    };
  
    setProjectLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create project");
      }
      const data = await res.json();
      console.log("Project created:", data);
      setMessage("Project created successfully.");
      setSubmitted(true);
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.message);
    } finally {
      setProjectLoading(false);
    }
  };
  
  // Reset the form state (including site_worker_id) on rapid reuse
  const handleAddAnotherProject = () => {
    const now = getLocalDateTimeString();
    setProjectData({
      job_id: "",
      quotation_number: "",
      floor: "",
      customer_name: "",
      address: "",
      manager_id: "",
      manager_name: "",
      duty_staff: "",
      site_worker_id: "",
      driver_id: "",
      company_id: "",
      hours_required: "",
      start_date: now,
      planned_end_date: "",
      key_code: "",
      status: "Planned",
    });
    setSubmitted(false);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleNewCompanyChange = (e) => {
    const { name, value } = e.target;
    setNewCompany((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAddCompany = async () => {
    if (!newCompany.name.trim()) return;
    setCompanySaving(true);
    try {
      let res;
      if (editMode) {
        res = await fetch(`${baseUrl}/api/projects/companies/${newCompany.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCompany),
        });
      } else {
        res = await fetch(`${baseUrl}/api/projects/companies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCompany),
        });
      }
      if (!res.ok)
        throw new Error(editMode ? "Failed to update company" : "Failed to create company");
  
      const updatedCompany = await res.json();
      let updatedCompanies;
      if (editMode) {
        updatedCompanies = companies.map((c) =>
          c.id === updatedCompany.id ? updatedCompany : c
        );
      } else {
        updatedCompanies = [...companies, updatedCompany];
      }
      setCompanies(updatedCompanies);
      setProjectData((prev) => ({
        ...prev,
        company_id: String(updatedCompany.id),
      }));
      setNewCompany({
        id: null,
        name: "",
        address: "",
        contact_email: "",
        contact_phone: "",
      });
      setShowAddCompanyModal(false);
      setEditMode(false);
    } catch (err) {
      console.error("Error adding/updating company:", err);
      setError(err.message);
    } finally {
      setCompanySaving(false);
    }
  };
  
  // Common styling
  const commonInputStyle = `w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 focus:border-blue-500 ${
    darkMode
      ? "bg-gray-700 text-white border-gray-600"
      : "bg-white text-gray-900 border-gray-300 shadow-inner"
  }`;
  const labelStyle = `block font-semibold mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  
  const chipStyle = (selected) =>
    `px-3 py-1 rounded-md cursor-pointer border mr-2 mb-2 ${
      selected
        ? "bg-blue-500 text-white border-blue-500"
        : darkMode
        ? "bg-gray-600 text-gray-200 border-gray-500"
        : "bg-gray-200 text-gray-700 border-gray-300"
    }`;
  
  const addCompanyButtonStyle = `
    inline-block px-4 py-1 mb-3 border rounded-md cursor-pointer font-normal text-md 
    ${darkMode ? "border-gray-500 bg-gray-700 text-gray-200" : "border-gray-300 bg-gray-100 text-gray-800"}
    hover:opacity-80 transition-colors
  `;
  
  return (
    <div className="flex flex-row flex-wrap items-start min-h-[200px] relative">
      {/* Left side: Company Chips */}
      <div className="ml-0 flex flex-wrap max-w-xs">
        {companies.map((company) => (
          <div key={company.id}>
            <div
              className={chipStyle(projectData.company_id === company.id.toString())}
              onClick={() => handleCompanySelect(company)}
            >
              {company.name}
            </div>
          </div>
        ))}
      </div>
  
      {/* Right side: Create Project form */}
      <div className="flex-1">
        <div
          className={`
            max-w-lg p-6 mx-40
            rounded-xl transition-all duration-500 transform
            ${darkMode ? "bg-gray-800 text-white shadow-lg border border-gray-700" : "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 shadow-2xl border border-gray-200"}
          `}
        >
          <h2 className="text-3xl font-bold text-center mb-4">Create Project</h2>
  
          {user?.role === "Administrator" && (
            <div
              className={addCompanyButtonStyle}
              onClick={() => {
                setEditMode(false);
                setCompanyModalMode("add");
                setNewCompany({
                  id: null,
                  name: "",
                  address: "",
                  contact_email: "",
                  contact_phone: "",
                });
                setShowAddCompanyModal(true);
              }}
            >
              + Add New Company
            </div>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Job ID */}
            <div>
              <label className={labelStyle}>
                Job ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="job_id"
                value={projectData.job_id}
                onChange={handleChange}
                onBlur={checkJobId}
                placeholder="Enter Job ID"
                className={commonInputStyle}
                disabled={submitted}
              />
            </div>
  
            {/* Quotation Number */}
            <div>
              <label className={labelStyle}>
                Quotation Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="quotation_number"
                value={projectData.quotation_number}
                onChange={handleChange}
                placeholder="Enter Quotation Number"
                className={commonInputStyle}
                disabled={submitted}
              />
            </div>
  
            {/* Floor */}
            <div>
              <label className={labelStyle}>
                Floor <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="floor"
                value={projectData.floor}
                onChange={handleChange}
                placeholder="e.g. 2, 5, 10"
                className={commonInputStyle}
                disabled={submitted}
                min="0"
              />
            </div>
  
            {/* Customer Name */}
            <div>
              <label className={labelStyle}>
                Customer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                value={projectData.customer_name}
                onChange={handleChange}
                placeholder="Enter Customer Name"
                className={commonInputStyle}
                disabled={submitted}
              />
            </div>
  
            {/* Address */}
            <div>
              <label className={labelStyle}>
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={projectData.address}
                onChange={handleChange}
                placeholder="Enter Project Address"
                className={commonInputStyle}
                disabled={submitted}
              />
            </div>
  
            {/* Manager Dropdown */}
            <div>
              <label className={labelStyle}>
                Manager <span className="text-red-500">*</span>
              </label>
              <select
                name="manager"
                value={projectData.manager_id}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedManager = managers.find(
                    (mgr) => mgr.id.toString() === selectedId
                  );
                  setProjectData((prev) => ({
                    ...prev,
                    manager_id: selectedId,
                    manager_name: selectedManager ? selectedManager.name : "",
                  }));
                }}
                className={commonInputStyle}
                disabled={submitted}
              >
                <option value="">Select Manager</option>
                {managers.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.name} - (ID: {mgr.id})
                  </option>
                ))}
              </select>
            </div>
  
            {/* Duty Staff Dropdown */}
            <div>
              <label className={labelStyle}>
                Duty Staff <span className="text-red-500">*</span>
              </label>
              <select
                name="duty_staff"
                value={projectData.duty_staff}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    duty_staff: e.target.value,
                  }))
                }
                className={commonInputStyle}
                disabled={submitted}
              >
                <option value="">Select Duty Staff</option>
                {dutyStaffUsers.map((staff) => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name} - (ID: {staff.id})
                  </option>
                ))}
              </select>
            </div>
  
            {/* Site Worker Dropdown */}
            <div>
              <label className={labelStyle}>
                Site Worker <span className="text-red-500">*</span>
              </label>
              <select
                name="site_worker_id"
                value={projectData.site_worker_id}
                onChange={handleChange}
                className={commonInputStyle}
                disabled={submitted}
              >
                <option value="">Select Site Worker</option>
                {siteWorkers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - (ID: {worker.id})
                  </option>
                ))}
              </select>
            </div>
  
            {/* Driver Dropdown */}
            <div>
              <label className={labelStyle}>
                Driver <span className="text-red-500">*</span>
              </label>
              <select
                name="driver_id"
                value={projectData.driver_id}
                onChange={(e) =>
                  setProjectData((prev) => ({
                    ...prev,
                    driver_id: e.target.value,
                  }))
                }
                className={commonInputStyle}
                disabled={submitted}
              >
                <option value="">Select Driver</option>
                {drivers.map((drv) => (
                  <option key={drv.id} value={drv.id}>
                    {drv.name} - (ID: {drv.id})
                  </option>
                ))}
              </select>
            </div>
  
            {/* Start Date */}
            <div>
              <label className={labelStyle}>
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="start_date"
                value={projectData.start_date}
                onChange={handleChange}
                className={commonInputStyle}
                disabled={submitted}
              />
            </div>
  
            {/* Hours Required */}
            <div>
              <label className={labelStyle}>
                Hours Required <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hours_required"
                value={projectData.hours_required}
                onChange={handleChange}
                placeholder="Enter Hours Required"
                className={commonInputStyle}
                disabled={submitted}
              />
            </div>
  
            {/* Planned End Date */}
            <div>
              <label className={labelStyle}>
                Planned End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="planned_end_date"
                value={projectData.planned_end_date}
                onChange={handleChange}
                className={commonInputStyle}
                disabled={submitted}
              />
            </div>
  
            {/* Key Code */}
            <div>
              <label className={labelStyle}>
                Key Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="key_code"
                value={projectData.key_code}
                onChange={handleChange}
                placeholder="Enter Key Code"
                className={commonInputStyle}
                disabled={submitted}
              />
            </div>
  
            {(error && !error.includes("Job ID")) || message ? (
              <div className="mt-2">
                {error && !error.includes("Job ID") && (
                  <p className="text-red-500 text-xs">{error}</p>
                )}
                {message && (
                  <>
                    <p className="text-green-600 text-xs">{message}</p>
                    <p onClick={handleAddAnotherProject} className="text-blue-500 cursor-pointer text-sm">
                      Create another project
                    </p>
                  </>
                )}
              </div>
            ) : null}
  
            <div className="mb-2">
              <button
                type="submit"
                disabled={!isFormValid() || submitted}
                className={`w-full py-2 mt-4 text-white rounded-lg transition-all duration-500 focus:outline-none ${
                  isFormValid() && !submitted
                    ? "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {projectLoading && <span className="animate-spin mr-2">⏳</span>}
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
  
      {/* Modal for Adding or Editing/Deleting a Company */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300">
          <div
            className={`p-6 rounded-2xl w-80 shadow-2xl transform transition-all ${
              darkMode
                ? "bg-gradient-to-br from-gray-600 to-gray-800 text-white"
                : "bg-gradient-to-br from-white to-gray-100 text-gray-800"
            }`}
          >
            {companyModalMode === "add" ? (
              <>
                <h2 className="text-xl font-bold mb-4">
                  {editMode ? "Edit Company" : "Add New Company"}
                </h2>
                <label className={labelStyle}>
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={newCompany.name}
                  onChange={handleNewCompanyChange}
                  placeholder="Company Name"
                  className={`${commonInputStyle} mb-2`}
                />
                <label className={labelStyle}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={newCompany.address}
                  onChange={handleNewCompanyChange}
                  placeholder="Company Address"
                  className={`${commonInputStyle} mb-2`}
                />
                <label className={labelStyle}>Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={newCompany.contact_email}
                  onChange={handleNewCompanyChange}
                  placeholder="Email"
                  className={`${commonInputStyle} mb-2`}
                />
                <label className={labelStyle}>Contact Phone</label>
                <input
                  type="text"
                  name="contact_phone"
                  value={newCompany.contact_phone}
                  onChange={handleNewCompanyChange}
                  placeholder="Phone Number"
                  className={`${commonInputStyle} mb-4`}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setError("");
                      setShowAddCompanyModal(false);
                    }}
                    className={`px-4 py-2 rounded ${darkMode ? "bg-gray-500 text-white" : "bg-gray-300 text-gray-700"}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCompany}
                    disabled={companySaving}
                    className={`px-4 py-2 rounded ${companySaving ? "bg-blue-400 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    {companySaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Select Company</h2>
                {error && companyModalMode === "editDelete" && (
                  <p className="text-red-500 text-xs mb-2">{error}</p>
                )}
                <select
                  className={commonInputStyle}
                  value={newCompany.id ? newCompany.id.toString() : ""}
                  onChange={(e) => {
                    const companyId = e.target.value;
                    if (!companyId) {
                      setNewCompany({
                        id: null,
                        name: "",
                        address: "",
                        contact_email: "",
                        contact_phone: "",
                      });
                      return;
                    }
                    const comp = companies.find((c) => c.id.toString() === companyId);
                    setError("");
                    setNewCompany(comp || { id: null, name: "", address: "", contact_email: "", contact_phone: "" });
                  }}
                >
                  <option value="">Select a company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => {
                      setError("");
                      setShowAddCompanyModal(false);
                    }}
                    className={`px-4 py-2 rounded ${darkMode ? "bg-gray-500 text-white" : "bg-gray-300 text-gray-700"}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newCompany?.id) {
                        setError("Please select a company.");
                        return;
                      }
                      setError("");
                      setCompanyModalMode("add");
                      setEditMode(true);
                    }}
                    disabled={!newCompany?.id || companySaving}
                    className={`px-4 py-2 rounded ${!newCompany?.id || companySaving ? "bg-blue-400 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    {companySaving ? "Saving..." : "Edit"}
                  </button>
                  <button
                    onClick={() => {
                      if (!newCompany?.id) {
                        setError("Please select a company.");
                        return;
                      }
                      if (window.confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
                        handleDeleteCompany(newCompany);
                      }
                    }}
                    disabled={!newCompany?.id || companySaving}
                    className={`px-4 py-2 rounded ${!newCompany?.id || companySaving ? "bg-red-400 text-white" : "bg-red-600 text-white hover:bg-red-700"}`}
                  >
                    {companySaving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Error Boundary to catch errors and display fallback UI
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}

// Wrap CreateProject with the ErrorBoundary
const WrappedCreateProject = (props) => (
  <ErrorBoundary>
    <CreateProject {...props} />
  </ErrorBoundary>
);

export default WrappedCreateProject;
