import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const StockEntry = () => {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    itemCode: "",
    itemName: "",
    quantity: "",
    description: ""
  });
  const [stockEntryTime, setStockEntryTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // detailsDisabled controls auto-populated fields (itemName and description)
  const [detailsDisabled, setDetailsDisabled] = useState(false);
  // submitted indicates a successful submission and disables the form
  const [submitted, setSubmitted] = useState(false);

  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  // Set initial stock entry time on Local
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const localISOTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setStockEntryTime(localISOTime);
  }, []);
  
  
  // Set initial stock entry time on mount (ISO format)
  //useEffect(() => {
   // setStockEntryTime(new Date().toISOString().slice(0, 16));
  //}, []);
  



  const isFormValid =
    formData.itemCode.trim() &&
    formData.itemName.trim() &&
    formData.quantity.toString().trim() &&
    formData.description.trim();

  // When the form is successfully submitted, disable inputs.
  const formDisabled = submitted;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For Item Code, force uppercase.
    const newValue = name === "itemCode" ? value.toUpperCase() : value;
    setFormData({ ...formData, [name]: newValue });
    if (message) setMessage("");
    if (error) setError("");
    if (name === "itemCode") {
      setDetailsDisabled(false);
      setSubmitted(false);
    }
  };

  // Function to check for an existing item using onBlur.
  const checkExistingItem = async (code) => {
    const trimmedCode = code.toString().trim();
    if (!trimmedCode) {
      setDetailsDisabled(false);
      return;
    }
    try {
      // New endpoint: /api/inventory/details/:itemCode
      const res = await fetch(`${baseUrl}/api/inventory/details/${trimmedCode}`);
      if (res.status === 404) {
        // Item not found—allow new entry.
        setDetailsDisabled(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data && data.item_code) {
          // Auto-populate itemName and description and disable these fields.
          setFormData((prev) => ({
            ...prev,
            itemName: data.item_name,
            description: data.description
          }));
          setDetailsDisabled(true);
        } else {
          setDetailsDisabled(false);
        }
      } else {
        setDetailsDisabled(false);
      }
    } catch (error) {
      console.error("Error checking existing item:", error);
      setDetailsDisabled(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!isFormValid) {
      setError("All fields are required.");
      return;
    }
    
    const parsedQuantity = parseInt(formData.quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }
    
    const payload = {
      itemCode: formData.itemCode.trim(),
      itemName: formData.itemName.trim(),
      quantity: parsedQuantity,
      description: formData.description.trim(),
      stockEntryTime: stockEntryTime
    };

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add inventory");
      } else {
        setMessage("Stock entry added");
        setSubmitted(true);
        setDetailsDisabled(true);
      }
    } catch (err) {
      console.error("Error adding stock:", err);
      setError("Error adding stock entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnotherEntry = () => {
    setFormData({ itemCode: "", itemName: "", quantity: "", description: "" });
    setDetailsDisabled(false);
    setSubmitted(false);
    setMessage("");
    setError("");
    setStockEntryTime(new Date().toISOString());
  };

  // Disabled styling for auto-populated fields
  const disabledStyle = darkMode
    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
    : "bg-gray-200 text-gray-500 cursor-not-allowed";

  // Shared input style
  const commonInputStyle = `w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 focus:border-blue-500`;

  return (
    <div className={`max-w-lg mx-auto p-8 rounded-xl transition-all duration-500 transform ${
      darkMode
        ? "bg-gray-800 text-white shadow-lg border border-gray-700"
        : "bg-gradient-to-br from-gray-100 to-gray-300 text-gray-900 shadow-2xl border border-gray-200"
    }`}>
      <h1 className="text-3xl font-bold text-center mb-6">Stock Entry</h1>
      <form onSubmit={handleSubmit}>
        {/* Single-column layout */}
        <div className="space-y-4">
          {/* Item Code Field with "Case Sensitive" label*/ }
          <div>
            <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Item Code <span className="text-red-500">*</span>
              {/* <span className="ml-2 text-xs italic text-blue-400">(Case Sensitive)</span>*/}
            </label>
            <input 
              type="text" 
              name="itemCode" 
              value={formData.itemCode} 
              onChange={handleChange} 
              onBlur={() => checkExistingItem(formData.itemCode)}
              placeholder="Enter item code" 
              style={{ textTransform: "uppercase" }}
              className={`${commonInputStyle} ${
                darkMode 
                  ? "bg-gray-700 text-white border-gray-600" 
                  : "bg-white text-gray-900 border-gray-300 shadow-inner"
              }`}
              disabled={formDisabled}
            />
          </div>
          {/* Item Name Field */}
          <div>
            <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Item Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="itemName" 
              value={formData.itemName} 
              onChange={handleChange} 
              placeholder="Enter item name" 
              disabled={detailsDisabled || formDisabled}
              pattern="[A-Za-z\s]+"
              title="Only letters and spaces are allowed"
              className={`${commonInputStyle} ${
                (detailsDisabled || formDisabled) ? disabledStyle : (darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300 shadow-inner")
              }`}
            />
          </div>
          {/* Quantity Field */}
          <div>
            <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Quantity <span className="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              name="quantity" 
              min="1"
              value={formData.quantity} 
              onChange={handleChange} 
              placeholder="Enter quantity" 
              className={`${commonInputStyle} ${
                darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300 shadow-inner"
              }`}
              disabled={formDisabled}
            />
          </div>
          {/* Description Field */}
          <div>
            <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Enter description" 
              disabled={detailsDisabled || formDisabled}
              className={`${commonInputStyle} ${
                (detailsDisabled || formDisabled) ? disabledStyle : (darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300 shadow-inner")
              }`}
            ></textarea>
          </div>
          {/* Stock Entry Time Field */}
          <div>
            <label className={`block font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Stock Entry Time
            </label>
            <input
  type="datetime-local"
  value={stockEntryTime}
  disabled
  className={`${commonInputStyle} ${
    darkMode
      ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
      : "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
  }`}
/>
         </div>
        </div>
        {/* Message Block */}
        <div className="min-h-[1.5rem] mt-2 text-left">
          {error && <p className="text-red-500 text-xs">{error}</p>}
          {message && (
            <div className="flex flex-col">
              <p className="text-green-600 text-xs">{message}</p>
              {submitted && (
                <p onClick={handleAddAnotherEntry} className="text-blue-500 cursor-pointer text-sm">
                  Add another entry
                </p>
              )}
            </div>
          )}
        </div>
        <button 
          type="submit"
          disabled={loading || !isFormValid || formDisabled}
          className={`w-full py-2 mt-4 text-white rounded-lg transition-all duration-500 ${
            loading || !isFormValid || formDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default StockEntry;
