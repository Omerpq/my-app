import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

// Helper function to get local date/time
const getLocalDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const DispatchManagement = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all stock requests
  const [stockRequests, setStockRequests] = useState([]);
  useEffect(() => {
    fetch(`${baseUrl}/api/request_stock`)
      .then((res) => res.json())
      .then((data) => setStockRequests(data))
      .catch((err) => console.error("Error fetching stock requests:", err));
  }, [baseUrl]);

  // Only approved requests
  const approvedRequests = stockRequests.filter((req) => req.status === "Approved");

  // Manager ID display
  const initialManagerDisplay = user ? `${user.role} - ${user.name} - ID: ${user.id}` : "";

  // Form state
  const [data, setData] = useState({
    managerId: initialManagerDisplay,
    requestId: "",
    itemsDispatched: "",
    itemName: "",
    dispatchedQty: "",
    dispatchDate: "",
    projectJobId: "",
    driverId: "",   // We'll store this as a string
    driverName: ""
  });

  const [availableStock, setAvailableStock] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dispatchConfirmed, setDispatchConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // For validating Request ID
  const [requestIdError, setRequestIdError] = useState("");
  const requestIdRef = useRef(null);

  // Auto-populate dispatchDate
  const currentDateTime = getLocalDateTime();

  // Styles for auto-populated fields
  const autoPopulatedClass = darkMode
    ? "bg-gray-600 text-gray-300 border-gray-500 cursor-default"
    : "bg-gray-200 text-gray-500 border-gray-300 cursor-default";

  // Shared input styles
  const commonInputStyle = `w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 focus:border-blue-500`;
  const inputClass = darkMode
    ? `${commonInputStyle} bg-gray-700 text-white border-gray-600`
    : `${commonInputStyle} bg-white text-gray-900 border-gray-300 shadow-inner`;

  // Generic change handler
  const handleChange = (e) => {
    setMessage("");
    setError("");
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // For item code => uppercase + fetch stock
  const handleItemChange = (e) => {
    const upperValue = e.target.value.toUpperCase();
    setData((prev) => ({ ...prev, itemsDispatched: upperValue }));
    setMessage("");
    setError("");
    fetchAvailableStock(upperValue.trim());
  };

  // When user selects a Request ID
  const handleRequestIdChange = (e) => {
    const value = e.target.value;
    setMessage("");
    setError("");
    setRequestIdError("");

    // Reset
    setData((prev) => ({
      ...prev,
      requestId: value,
      itemsDispatched: "",
      itemName: "",
      dispatchedQty: "",
      projectJobId: "",
      driverId: "",
      driverName: ""
    }));

    const matchingRequest = approvedRequests.find((r) => String(r.id) === value);
    if (matchingRequest) {
      // Populate item code, name, quantity
      setData((prev) => ({
        ...prev,
        requestId: value,
        itemsDispatched: matchingRequest.item_code,
        itemName: matchingRequest.item_name,
        dispatchedQty: matchingRequest.quantity
      }));
      fetchAvailableStock(matchingRequest.item_code);

      // If there's a job_id, fetch the project => driver
      if (matchingRequest.job_id) {
        setData((prev) => ({ ...prev, projectJobId: matchingRequest.job_id }));
        fetchProjectAndDriver(matchingRequest.job_id);
      }
    }
  };

  // Validate typed Request ID on blur
  const validateRequestId = (e) => {
    const value = e.target.value.trim();
    const isValid = approvedRequests.some((req) => String(req.id) === value);
    if (!isValid) {
      setRequestIdError("Please select a valid Request ID from the list.");
      setData((prev) => ({
        ...prev,
        requestId: "",
        itemsDispatched: "",
        itemName: "",
        dispatchedQty: "",
        projectJobId: "",
        driverId: "",
        driverName: ""
      }));
      requestIdRef.current.focus();
    }
  };

  // Minimal function to fetch project => driver
  const fetchProjectAndDriver = async (jobId) => {
    try {
      // We call /api/projects/by-job/:jobId
      const projectRes = await fetch(`${baseUrl}/api/projects/by-job/${jobId}`);
      if (!projectRes.ok) {
        console.error("Project fetch error:", projectRes.statusText);
        return;
      }
      const project = await projectRes.json(); // { job_id, driver_id, driver_name }

      // Convert driver_id to string
      const driverIdStr = project.driver_id ? String(project.driver_id) : "";

      setData((prev) => ({
        ...prev,
        projectJobId: project.job_id || "",
        driverId: driverIdStr, // Ensure it's a string
        driverName: project.driver_name
          ? `${project.driver_name} - (ID: ${project.driver_id})`
          : ""
      }));
    } catch (err) {
      console.error("Error fetching project/driver:", err);
    }
  };

  // Fetch stock
  const fetchAvailableStock = async (itemCode) => {
    try {
      const res = await fetch(`${baseUrl}/api/inventory/item/${itemCode}`);
      const result = await res.json();
      if (!result.error) {
        setAvailableStock(result.quantity);
      } else {
        setAvailableStock(0);
      }
    } catch (err) {
      console.error("Error fetching stock:", err);
      setAvailableStock(0);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const qty = parseInt(data.dispatchedQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }
    if (availableStock !== null && qty > availableStock) {
      setError("Error: Dispatched quantity exceeds available stock.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        managerId: user.id,
        dispatchDate: data.dispatchDate || currentDateTime
      };
      const res = await fetch(`${baseUrl}/api/dispatches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const response = await res.json();
      if (res.ok) {
        setMessage("Dispatch confirmed successfully.");
        setDispatchConfirmed(true);
      } else {
        setError(response.error || "Error confirming dispatch.");
      }
    } catch (err) {
      console.error("Error confirming dispatch:", err);
      setError("Error confirming dispatch.");
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleNewDispatch = () => {
    setDispatchConfirmed(false);
    setMessage("");
    setError("");
    setData({
      managerId: initialManagerDisplay,
      requestId: "",
      itemsDispatched: "",
      itemName: "",
      dispatchedQty: "",
      dispatchDate: "",
      projectJobId: "",
      driverId: "",
      driverName: ""
    });
    setAvailableStock(null);
    setRequestIdError("");
  };

  // Check if form is valid
  // driverId is now a string, so trim() is safe
  const isFormValid =
    data.requestId.trim() &&
    data.itemsDispatched.trim() &&
    data.dispatchedQty.toString().trim() &&
    data.projectJobId.trim() &&
    data.driverId.trim() && // now safe
    availableStock !== null &&
    !dispatchConfirmed;

  return (
    <div
      className={`max-w-lg mx-auto p-8 rounded-xl transition-all duration-500 transform ${
        darkMode
          ? "bg-gray-800 text-white shadow-lg border border-gray-700"
          : "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 shadow-2xl border border-gray-200"
      }`}
    >
      <h2 className="text-3xl font-bold text-center mb-6">Dispatch Management</h2>
            <form onSubmit={handleSubmit}>
        {/* Manager ID */}
        <div className="mt-4">
          <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Manager ID
          </label>
          <input
            type="text"
            name="managerId"
            value={data.managerId}
            readOnly
            className={`${commonInputStyle} ${autoPopulatedClass}`}
          />
        </div>

        {/* Request ID Field */}
        <div className="mt-4">
          <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Request ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="requestId"
            list="approvedRequests"
            value={data.requestId}
            onChange={handleRequestIdChange}
            onBlur={validateRequestId}
            placeholder="Type to search request ID"
            className={inputClass}
            disabled={dispatchConfirmed}
            ref={requestIdRef}
          />
          <datalist id="approvedRequests">
            {approvedRequests.map((req) => (
              <option key={req.id} value={req.id}>
                {req.id} - {req.item_code} - {req.item_name}
              </option>
            ))}
          </datalist>
          {requestIdError && (
            <p className="text-red-500 text-xs mt-1">{requestIdError}</p>
          )}
        </div>

        {/* Project Field */}
        <div className="mt-4">
          <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Project <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="projectJobId"
            value={data.projectJobId}
            readOnly
            className={`${commonInputStyle} ${autoPopulatedClass}`}
            disabled
          />
        </div>

        {/* Item Code/SKU */}
        <div className="mt-4">
          <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Item Code/SKU (For Dispatch) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="itemsDispatched"
            value={data.itemsDispatched}
            onChange={handleItemChange}
            placeholder="e.g. SKU123"
            className={inputClass}
            style={{ textTransform: "uppercase" }}
            disabled={dispatchConfirmed}
          />
        </div>

        {/* Item Name (auto-populated) */}
        <div className="mt-4">
          <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Item Name
          </label>
          <input
            type="text"
            name="itemName"
            value={data.itemName}
            readOnly
            className={`${commonInputStyle} ${autoPopulatedClass}`}
          />
        </div>

        {/* Quantity (auto-populated) */}
        <div className="mt-4">
          <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Quantity (To Dispatch) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="dispatchedQty"
            value={data.dispatchedQty}
            readOnly
            className={`${commonInputStyle} ${autoPopulatedClass}`}
            disabled
          />
        </div>

        {/* Driver (auto-populated) */}
        <div className="mt-4">
          <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Driver <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="driverName"
            value={data.driverName}
            readOnly
            className={`${commonInputStyle} ${autoPopulatedClass}`}
            disabled
          />
        </div>
        {/* Hidden driverId */}
        <input type="hidden" name="driverId" value={data.driverId} />

        {/* Dispatch Date/Time */}
        <div className="mt-4">
          <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Dispatch Date and Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="dispatchDate"
            value={data.dispatchDate || currentDateTime}
            onChange={handleChange}
            className={inputClass}
            disabled={dispatchConfirmed}
          />
        </div>

        {/* Error/Success Messages */}
        <div className="min-h-[1.5rem] mt-2 text-left">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
        </div>

        {/* Make Another Dispatch */}
        {dispatchConfirmed && (
          <p
            onClick={handleNewDispatch}
            className="mt-2 text-blue-500 cursor-pointer text-lg font-semibold text-left"
          >
            Make another dispatch
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !isFormValid || dispatchConfirmed}
          className={`block w-full py-2 mt-4 text-white rounded-lg transition-all duration-500 ${
            loading || !isFormValid || dispatchConfirmed
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
          } focus:outline-none`}
        >
          {loading ? "Submitting..." : "Confirm Dispatch"}
        </button>
      </form>
    </div>
  );
};

export default DispatchManagement;
