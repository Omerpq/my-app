import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

// Helper function to get local time
const getLocalDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const RequestStock = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  // Check for permission to show the form.
  if (!user || (!user.permissions?.includes("canRequestStock") && user.role !== "Administrator")) {
    return null;
  }

  // Use user's data for the Requesting Staff field.
  const siteWorkerValue = `${user.name} - ${user.role} - (ID: ${user.id})`;

  // NEW: State for request type selection ("stock", "pickup", or "both")
  const [requestType, setRequestType] = useState("stock");

  // State for stock request data.
  const [requestData, setRequestData] = useState({
    siteWorker: siteWorkerValue,
    requestDate: getLocalDateTime(),
    itemName: "",
    itemCode: "",
    quantity: "",
    deliveryLocation: "",
    urgency: "",
    jobId: ""
  });

  const [availableQuantity, setAvailableQuantity] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 2) List of available item names from inventory.
  const [itemNames, setItemNames] = useState([]);

  // 3) List of projects for the dropdown.
  const [projects, setProjects] = useState([]);

  // NEW: State for Pickup Request field.
  const [pickupDateTime, setPickupDateTime] = useState("");

  // Input styling.
  const inputClass = `w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
    darkMode
      ? "bg-gray-700 text-white border-gray-600"
      : "bg-white text-gray-900 border-gray-300"
  }`;

  const selectClass = `w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
    darkMode
      ? "bg-gray-700 text-white border-gray-600"
      : "bg-gray-100 text-gray-900 border-gray-300"
  }`;

  // Refs for vertical navigation.
  const itemNameRef = useRef(null);
  const quantityRef = useRef(null);
  const deliveryLocationRef = useRef(null);
  const requestDateRef = useRef(null);
  const urgencyRef = useRef(null);

  // For arrow navigation.
  const handleVerticalNavigation = (e, fieldName) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      switch (fieldName) {
        case "itemName":
          quantityRef.current?.focus();
          break;
        case "quantity":
          deliveryLocationRef.current?.focus();
          break;
        case "deliveryLocation":
          requestDateRef.current?.focus();
          break;
        case "requestDate":
          urgencyRef.current?.focus();
          break;
        default:
          break;
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      switch (fieldName) {
        case "urgency":
          requestDateRef.current?.focus();
          break;
        case "requestDate":
          deliveryLocationRef.current?.focus();
          break;
        case "deliveryLocation":
          quantityRef.current?.focus();
          break;
        case "quantity":
          itemNameRef.current?.focus();
          break;
        default:
          break;
      }
    }
  };

  // 4) Fetch item names from inventory.
  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/inventory`);
        if (res.ok) {
          const data = await res.json();
          const names = Array.from(new Set(data.map((item) => item.item_name.trim())));
          setItemNames(names);
        }
      } catch (err) {
        console.error("Error fetching item names:", err);
      }
    };
    fetchItemNames();
  }, [baseUrl]);

  // 5) Fetch projects.
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/projects`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, [baseUrl]);

  // 6) When user picks an item name from the dropdown (only for stock requests).
  const handleItemNameChange = (e) => {
    const selectedName = e.target.value;
    setRequestData((prev) => ({
      ...prev,
      itemName: selectedName,
      itemCode: ""
    }));
    setMessage("");
    setError("");
    setAvailableQuantity(null);
    checkExistingName(selectedName.trim());
  };

  // 7) Lookup item code & available quantity by item name.
  const checkExistingName = async (itemName) => {
    if (!itemName) return;
    try {
      const res = await fetch(`${baseUrl}/api/inventory`);
      if (!res.ok) {
        console.error("Error fetching inventory for item name:", res.statusText);
        return;
      }
      const data = await res.json();
      const matched = data.find((item) => item.item_name.trim() === itemName);
      if (matched) {
        setRequestData((prev) => ({
          ...prev,
          itemCode: matched.item_code.trim()
        }));
        const qtyRes = await fetch(`${baseUrl}/api/inventory/item/${matched.item_code.trim()}`);
        if (qtyRes.ok) {
          const qtyData = await qtyRes.json();
          setAvailableQuantity(qtyData && qtyData.quantity !== undefined ? qtyData.quantity : 0);
        } else {
          setAvailableQuantity(0);
        }
      }
    } catch (err) {
      console.error("Error in checkExistingName:", err);
    }
  };

  // For other input changes.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData({ ...requestData, [name]: value });
    setMessage("");
    setError("");
  };

  // Form validation depends on the selected request type.
  let isStockValid = true;
  if (requestType === "stock" || requestType === "both") {
    isStockValid =
      requestData.siteWorker.trim() &&
      requestData.requestDate.trim() &&
      requestData.itemName.trim() &&
      requestData.itemCode.trim() &&
      requestData.quantity.toString().trim() &&
      requestData.deliveryLocation.trim() &&
      requestData.jobId.trim();
  }
  let isPickupValid = true;
  if (requestType === "pickup" || requestType === "both") {
    isPickupValid = requestData.jobId.trim() && pickupDateTime.trim();
  }
  const isFormValid = isStockValid && isPickupValid;

  // Submit handler builds the payload conditionally.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!isFormValid) {
      setError("All required fields must be filled.");
      return;
    }

    const parsedQty = parseInt(requestData.quantity, 10);
    if ((requestType === "stock" || requestType === "both") && (isNaN(parsedQty) || parsedQty <= 0)) {
      setError("Quantity must be a positive number.");
      return;
    }
    if ((requestType === "stock" || requestType === "both") && availableQuantity !== null && parsedQty > availableQuantity) {
      setError(
        `Entered quantity (${parsedQty}) exceeds available stock (${availableQuantity}). Please enter a quantity less than or equal to the available stock.`
      );
      return;
    }

    // Build payload conditionally based on requestType.
    const payload = {
      site_worker: requestData.siteWorker.trim(),
      request_date: requestData.requestDate.trim(),
      item_code: requestType === "pickup" ? "" : requestData.itemCode.trim(),
      item_name: requestType === "pickup" ? "" : requestData.itemName.trim(),
      quantity: requestType === "pickup" ? 0 : parsedQty,
      delivery_location: requestType === "pickup" ? "" : requestData.deliveryLocation.trim(),
      urgency: requestType === "pickup" ? "Normal" : requestData.urgency.trim() || "Normal",
      requestor_email: user.email,
      status: "Pending",
      approval_status: "Pending",
      job_id: requestData.jobId.trim(),
      pickup_requested: requestType === "pickup" || requestType === "both",
      pickup_datetime: (requestType === "pickup" || requestType === "both") ? pickupDateTime : null,
      request_type: requestType
    };

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/request_stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit request");
      } else {
        setMessage("Request submitted");
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      setError("Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnotherRequest = () => {
    setRequestData({
      siteWorker: siteWorkerValue,
      requestDate: getLocalDateTime(),
      itemName: "",
      itemCode: "",
      quantity: "",
      deliveryLocation: "",
      urgency: "",
      jobId: ""
    });
    setAvailableQuantity(null);
    setSubmitted(false);
    setMessage("");
    setError("");
    setRequestType("stock");
    setPickupDateTime("");
  };

  return (
    <div
      className={`max-w-lg mx-auto p-8 rounded-xl transition-all duration-500 transform ${
        darkMode
          ? "bg-gray-800 text-white shadow-lg border border-gray-700"
          : "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 shadow-2xl border border-gray-200"
      }`}
    >
      <h2 className="text-3xl font-bold text-center mb-6">Create Request</h2>
      
      {/* Request Type Selection */}
      <div className="mb-4">
        <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          Select Request Type
        </label>
        <div className="flex space-x-4 mt-1">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="requestType"
              value="stock"
              checked={requestType === "stock"}
              onChange={(e) => setRequestType(e.target.value)}
              className="form-radio"
            />
            <span className="ml-2">Stock Request Only</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="requestType"
              value="pickup"
              checked={requestType === "pickup"}
              onChange={(e) => setRequestType(e.target.value)}
              className="form-radio"
            />
            <span className="ml-2">Pickup Request Only</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="requestType"
              value="both"
              checked={requestType === "both"}
              onChange={(e) => setRequestType(e.target.value)}
              className="form-radio"
            />
            <span className="ml-2">Both</span>
          </label>
        </div>
      </div>
      
      {/* Project Dropdown (always visible) */}
      <div className="mb-4">
        <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          Project <span className="text-red-500">*</span>
        </label>
        <select
          name="jobId"
          value={requestData.jobId}
          onChange={(e) => setRequestData((prev) => ({ ...prev, jobId: e.target.value }))}
          className={selectClass}
          required
        >
          <option value="">-- Select a Project --</option>
          {projects.map((proj) => (
            <option key={proj.job_id} value={proj.job_id}>
              {proj.job_id} - {proj.address}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Requesting Staff (read-only) */}
          <div>
            <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Requesting Staff (Name - Role - (ID: xx)) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="siteWorker"
              value={requestData.siteWorker}
              readOnly
              className={inputClass}
              tabIndex={-1}
            />
          </div>

          {/* Conditionally render stock-specific fields if requestType is not "pickup" */}
          {requestType !== "pickup" && (
            <>
              {/* Item Name Dropdown */}
              <div>
                <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Item Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="itemName"
                  value={requestData.itemName}
                  onChange={handleItemNameChange}
                  onKeyDown={(e) => handleVerticalNavigation(e, "itemName")}
                  ref={itemNameRef}
                  className={selectClass}
                >
                  <option value="">Select item name</option>
                  {itemNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Code (auto-populated) */}
              <div>
                <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Item Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="itemCode"
                  value={requestData.itemCode}
                  readOnly
                  className={`w-full px-4 py-2 mt-2 border rounded-lg cursor-not-allowed focus:outline-none ${
                    darkMode ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-200 text-gray-500 border-gray-300"
                  }`}
                />
              </div>

              {/* Total Quantity Available */}
              <div>
                <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Total Quantity Available
                </label>
                <input
                  type="number"
                  value={availableQuantity !== null ? availableQuantity : ""}
                  readOnly
                  disabled
                  className={`w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none ${
                    darkMode
                      ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                      : "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                  }`}
                  tabIndex={-1}
                />
              </div>

              {/* Quantity */}
              <div>
                <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={availableQuantity !== null ? availableQuantity : undefined}
                  value={requestData.quantity}
                  onChange={handleChange}
                  onKeyDown={(e) => handleVerticalNavigation(e, "quantity")}
                  ref={quantityRef}
                  placeholder="Enter quantity"
                  className={inputClass}
                />
              </div>

              {/* Delivery Location */}
              <div>
                <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Delivery Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="deliveryLocation"
                  value={requestData.deliveryLocation}
                  onChange={handleChange}
                  onKeyDown={(e) => handleVerticalNavigation(e, "deliveryLocation")}
                  ref={deliveryLocationRef}
                  placeholder="Enter delivery location"
                  className={inputClass}
                />
              </div>

              {/* Urgency */}
              <div>
                <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Urgency (optional)
                </label>
                <input
                  type="text"
                  name="urgency"
                  value={requestData.urgency}
                  onChange={handleChange}
                  onKeyDown={(e) => handleVerticalNavigation(e, "urgency")}
                  ref={urgencyRef}
                  placeholder="e.g. High, Medium, Low"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {/* Render Pickup Date/Time if requestType is "pickup" or "both" */}
          {(requestType === "pickup" || requestType === "both") && (
            <div>
              <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Pickup Date &amp; Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={pickupDateTime}
                onChange={(e) => setPickupDateTime(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {/* Request Date & Time */}
          <div>
            <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Request Date &amp; Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="requestDate"
              value={requestData.requestDate}
              onChange={handleChange}
              onKeyDown={(e) => handleVerticalNavigation(e, "requestDate")}
              ref={requestDateRef}
              className={inputClass}
            />
          </div>
        </div>

        {/* Message Block */}
        <div className="min-h-[1.5rem] mt-1">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && (
            <>
              <p className="text-green-600 text-sm">{message}</p>
              <p onClick={handleAddAnotherRequest} className="text-blue-500 cursor-pointer text-base mt-1">
                Add another request
              </p>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !isFormValid || submitted}
          className={`block w-full mx-auto py-2 mt-6 text-white rounded-lg transition-all duration-500 ${
            loading || !isFormValid || submitted
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
          } focus:outline-none`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Create Request"
          )}
        </button>
      </form>
    </div>
  );
};

export default RequestStock;
