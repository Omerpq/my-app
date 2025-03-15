// src/Components/BTForm.jsx
import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DarkModeToggle from "./DarkModeToggle";

// Reusable input style
const inputClass = (darkMode) => `
  w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500
  ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300 shadow-inner"}
`;

// Reusable label style
const labelClass = (darkMode) => `
  block font-semibold
  ${darkMode ? "text-gray-300" : "text-gray-700"}
`;

const BTForm = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const baseUrl = import.meta.env.VITE_BACKEND_URL;
  const { projectId } = useParams();

  const [existingFormId, setExistingFormId] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  // ----------------------------------
  // Form States
  // ----------------------------------
  const [attachment, setAttachment] = useState(null);

  const [sender, setSender] = useState({
    name: "",
    address: "",
    tel: "",
    fax: "",
    otherDetail: "",
    refSupplier: "",
    brandNumber: "",
    provenance: "",
    service: "",
  });

  const [workOrder, setWorkOrder] = useState({
    date: "",
    customer: "",
    customerAddress: "",
    phone: "",
    emitter: "",
  });

  const [location, setLocation] = useState({
    program: "",
    batch: "",
    building: "",
    stair: "",
    floor: "",
    apartment: "",
    module: "",
    guard: "",
    keyRetrieval: "",
  });

  const [period, setPeriod] = useState({ start: "", end: "" });
  const [items, setItems] = useState([
    { article: "", headDetail: "", workDetail: "", mUnit: "", qty: 1, total: 0 },
  ]);
  const [vatPercent, setVatPercent] = useState(20);
  const [grandTotal, setGrandTotal] = useState(0);

  // Fetch existing "bt-form" if any
  useEffect(() => {
    if (!projectId) return;

    const fetchExistingBTForm = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/projects/forms/${projectId}`);
        if (!res.ok) return;

        const formsArray = await res.json();
        const formRecord = formsArray.find((f) => f.form_type === "bt-form");
        if (formRecord && formRecord.form_data) {
          setExistingFormId(formRecord.id);

          const data = formRecord.form_data;

          // If there's a file in attached_files, show placeholder
          if (formRecord.attached_files && formRecord.attached_files.length > 0) {
            const meta = (data.filesMetadata && data.filesMetadata[0]) || {};
            setAttachment({
              name: meta.name || "(existing file)",
              type: meta.mimeType || "application/octet-stream",
              size: meta.size || 0,
              data: null,
            });
          }

          setSender(data.sender || {});
          setWorkOrder(data.workOrder || {});
          setLocation(data.location || {});
          setPeriod(data.period || {});
          setItems(data.items || []);
          setVatPercent(data.vatPercent || 20);
          setGrandTotal(data.grandTotal || 0);

          // Start in read-only summary mode
          setIsEditing(false);
        }
      } catch (error) {
        console.error("Error fetching existing BT Form:", error);
      }
    };

    fetchExistingBTForm();
  }, [projectId, baseUrl]);

  // Convert ArrayBuffer -> Base64
  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    if (!file) {
      setAttachment(null);
      setIsDirty(true);
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      const base64String = arrayBufferToBase64(reader.result);
      setAttachment({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size || 0,
        data: base64String,
      });
      setIsDirty(true);
    };
  };

  const handleChange = (e, groupSetter) => {
    const { name, value } = e.target;
    groupSetter((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index][field] = value;
      return newItems;
    });
    setIsDirty(true);
  };

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      { article: "", headDetail: "", workDetail: "", mUnit: "", qty: 1, total: 0 },
    ]);
    setIsDirty(true);
  };

  const handleRemoveRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const calculateTotals = () => {
    let subTotal = 0;
    const newItems = items.map((item) => {
      // Example: total = qty * 10
      const computedTotal = parseFloat(item.qty || 0) * 10;
      subTotal += computedTotal;
      return { ...item, total: computedTotal };
    });
    setItems(newItems);
    const vatValue = (subTotal * parseFloat(vatPercent || 0)) / 100;
    setGrandTotal(subTotal + vatValue);
  };

  const handleItemsChangeAndRecalc = (index, field, value) => {
    handleItemChange(index, field, value);
    setTimeout(() => calculateTotals(), 0);
  };

  const handleVatChange = (e) => {
    setVatPercent(e.target.value);
    setIsDirty(true);
    setTimeout(() => calculateTotals(), 0);
  };

  const handleCancel = () => {
    const confirmDiscard = window.confirm(
      "Any unsaved changes will be lost. Do you want to continue?"
    );
    if (confirmDiscard) {
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = {
      sender,
      workOrder,
      location,
      period,
      items,
      vatPercent,
      grandTotal,
      filesMetadata: attachment
        ? [
            {
              name: attachment.name,
              mimeType: attachment.type,
              size: attachment.size,
            },
          ]
        : [],
    };

    try {
      let endpoint = `${baseUrl}/api/forms`;
      let method = "POST";

      let bodyPayload = {
        job_id: projectId,
        form_type: "bt-form",
        form_data: formDataObj,
        attached_files: attachment && attachment.data ? [attachment.data] : [],
      };

      if (existingFormId) {
        endpoint = `${baseUrl}/api/forms/${existingFormId}`;
        method = "PUT";
        bodyPayload = {
          form_data: formDataObj,
          attached_files: attachment && attachment.data ? [attachment.data] : [],
        };
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errMessage = await response.text();
        console.error("Error saving form:", errMessage);
        alert("Failed to save form in DB!");
        return;
      }

      const savedRecord = await response.json();
      console.log("Form record saved:", savedRecord);

      if (!existingFormId && savedRecord.id) {
        setExistingFormId(savedRecord.id);
      }
      alert("BT Form submitted & stored in DB!");
      setIsEditing(false);
      setIsDirty(false);
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Failed to save form in DB!");
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(2)} ${units[i]}`;
  };

  const renderFilledView = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4">BT Form Summary</h3>
      <div
        className={`${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
        } p-6 rounded-lg shadow-lg`}
      >
        <p>
          <strong>Sender Name:</strong> {sender.name || "N/A"}
        </p>
        <p>
          <strong>Sender Address:</strong> {sender.address || "N/A"}
        </p>
        <p>
          <strong>Customer:</strong> {workOrder.customer || "N/A"}
        </p>
        <p>
          <strong>Work Order Date:</strong> {workOrder.date || "N/A"}
        </p>
        <p>
          <strong>Period:</strong>{" "}
          {period.start ? `${period.start} to ${period.end || "N/A"}` : "N/A"}
        </p>
        <p>
          <strong>Grand Total:</strong> {grandTotal.toFixed(2)}
        </p>

        {attachment && (
          <div className="mt-4">
            <p>
              <strong>File:</strong> {attachment.name} <br />
              <strong>Type:</strong> {attachment.type} <br />
              <strong>Size:</strong> {formatBytes(attachment.size)}
            </p>

            {existingFormId !== null && (
              <div className="mt-2">
                <a
                  href={`${baseUrl}/api/projects/forms/${existingFormId}/file/0`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  Open Attached File
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Header */}
      <header
        className={`flex justify-between items-center p-6 shadow-lg border ${
          darkMode
            ? "bg-gray-800 text-white border-gray-700"
            : "bg-white text-gray-900 border-gray-200"
        }`}
      >
        <div className="text-xl font-semibold">BT Form</div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span
              className={`text-sm ${
                darkMode ? "text-yellow-600" : "text-gray-500"
              }`}
            >
              {user.role}
            </span>
            <span className="text-xs">{user.name}</span>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      <main className="p-6 transition-all duration-500">
        {/* 
          Minimal approach: show top bar in both modes. 
          If isEditing => if there's an existing form => go to summary (setIsEditing(false)),
          else => window.history.back().
          If not editing => always go back in browser history.
        */}
        <div className="mb-12 flex gap-4">
          <button
            onClick={() => {
              if (isEditing) {
                if (existingFormId) {
                  // Already-filled => go back to summary
                  setIsEditing(false);
                } else {
                  // Brand new => go back in history
                  window.history.back();
                }
              } else {
                // Not editing => summary => go back
                window.history.back();
              }
            }}
            className="px-6 py-2 bg-[#ff9933] text-white hover:bg-[#ff7700] rounded-lg shadow-md"
          >
            Back
          </button>
          {/* If not editing and there's an existing form => show "Edit Form" */}
          {!isEditing && existingFormId && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md"
            >
              Edit Form
            </button>
          )}
        </div>

        <div
          className={`
            p-6 rounded-xl transition-all duration-500 transform
            ${
              darkMode
                ? "bg-gray-800 text-white shadow-lg border border-gray-700"
                : "bg-white text-gray-900 shadow-2xl border border-gray-200"
            }
          `}
        >
          <h2 className="text-3xl font-bold text-center mb-6">
            BT Form for Project {projectId || "N/A"}
          </h2>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Attachment */}
              <div>
                <label className={labelClass(darkMode)}>File Attachment:</label>
                <input type="file" onChange={handleFileChange} className="mt-2" />
                {attachment && (
                  <p className="text-xs mt-1 text-green-400">
                    Attached: {attachment.name} ({formatBytes(attachment.size)})
                  </p>
                )}
              </div>

              {/* Sender & Work Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold mb-2">Sender Info</h3>
                  <label className={labelClass(darkMode)}>
                    Name
                    <input
                      type="text"
                      name="name"
                      value={sender.name}
                      onChange={(e) => handleChange(e, setSender)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Address
                    <input
                      type="text"
                      name="address"
                      value={sender.address}
                      onChange={(e) => handleChange(e, setSender)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Tel
                    <input
                      type="text"
                      name="tel"
                      value={sender.tel}
                      onChange={(e) => handleChange(e, setSender)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Fax
                    <input
                      type="text"
                      name="fax"
                      value={sender.fax}
                      onChange={(e) => handleChange(e, setSender)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Other Detail
                    <input
                      type="text"
                      name="otherDetail"
                      value={sender.otherDetail}
                      onChange={(e) => handleChange(e, setSender)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Ref Supplier #
                    <input
                      type="text"
                      name="refSupplier"
                      value={sender.refSupplier}
                      onChange={(e) => handleChange(e, setSender)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Brand #
                    <input
                      type="text"
                      name="brandNumber"
                      value={sender.brandNumber}
                      onChange={(e) => handleChange(e, setSender)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Provenance
                    <input
                      type="text"
                      name="provenance"
                      value={sender.provenance}
                      onChange={(e) => handleChange(e, setSender)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Service
                    <input
                      type="text"
                      name="service"
                      value={sender.service}
                      onChange={(e) => handleChange(e, setSender)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold mb-2">Work Order</h3>
                  <label className={labelClass(darkMode)}>
                    Date
                    <input
                      type="date"
                      name="date"
                      value={workOrder.date}
                      onChange={(e) => handleChange(e, setWorkOrder)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Customer
                    <input
                      type="text"
                      name="customer"
                      value={workOrder.customer}
                      onChange={(e) => handleChange(e, setWorkOrder)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Address
                    <input
                      type="text"
                      name="customerAddress"
                      value={workOrder.customerAddress}
                      onChange={(e) => handleChange(e, setWorkOrder)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Phone
                    <input
                      type="text"
                      name="phone"
                      value={workOrder.phone}
                      onChange={(e) => handleChange(e, setWorkOrder)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Emitter
                    <input
                      type="text"
                      name="emitter"
                      value={workOrder.emitter}
                      onChange={(e) => handleChange(e, setWorkOrder)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
              </div>

              {/* Location Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={labelClass(darkMode)}>
                    Program
                    <input
                      type="text"
                      name="program"
                      value={location.program}
                      onChange={(e) => handleChange(e, setLocation)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Batch
                    <input
                      type="text"
                      name="batch"
                      value={location.batch}
                      onChange={(e) => handleChange(e, setLocation)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Building
                    <input
                      type="text"
                      name="building"
                      value={location.building}
                      onChange={(e) => handleChange(e, setLocation)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={labelClass(darkMode)}>
                    Stair
                    <input
                      type="text"
                      name="stair"
                      value={location.stair}
                      onChange={(e) => handleChange(e, setLocation)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Floor
                    <input
                      type="text"
                      name="floor"
                      value={location.floor}
                      onChange={(e) => handleChange(e, setLocation)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Apartment
                    <input
                      type="text"
                      name="apartment"
                      value={location.apartment}
                      onChange={(e) => handleChange(e, setLocation)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={labelClass(darkMode)}>
                    Module
                    <input
                      type="text"
                      name="module"
                      value={location.module}
                      onChange={(e) => handleChange(e, setLocation)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Guard
                    <input
                      type="text"
                      name="guard"
                      value={location.guard}
                      onChange={(e) => handleChange(e, setLocation)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Key Retrieval
                    <input
                      type="text"
                      name="keyRetrieval"
                      value={location.keyRetrieval}
                      onChange={(e) => handleChange(e, setLocation)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
              </div>

              {/* Period */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-2">Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={labelClass(darkMode)}>
                    From
                    <input
                      type="date"
                      name="start"
                      value={period.start}
                      onChange={(e) => handleChange(e, setPeriod)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    To
                    <input
                      type="date"
                      name="end"
                      value={period.end}
                      onChange={(e) => handleChange(e, setPeriod)}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
              </div>

              {/* Work Items Table */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold mb-2">Work Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse">
                    <thead
                      className={`${
                        darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
                      }`}
                    >
                      <tr>
                        <th className="px-2 py-2 text-xs">Article</th>
                        <th className="px-2 py-2 text-xs">Head Detail</th>
                        <th className="px-2 py-2 text-xs">Work Detail</th>
                        <th className="px-2 py-2 text-xs">M Unit</th>
                        <th className="px-2 py-2 text-xs">Qty</th>
                        <th className="px-2 py-2 text-xs">Total</th>
                        <th className="px-2 py-2 text-xs">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.article}
                              onChange={(e) =>
                                handleItemsChangeAndRecalc(index, "article", e.target.value)
                              }
                              className={inputClass(darkMode)}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.headDetail}
                              onChange={(e) =>
                                handleItemsChangeAndRecalc(index, "headDetail", e.target.value)
                              }
                              className={inputClass(darkMode)}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.workDetail}
                              onChange={(e) =>
                                handleItemsChangeAndRecalc(index, "workDetail", e.target.value)
                              }
                              className={inputClass(darkMode)}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={item.mUnit}
                              onChange={(e) =>
                                handleItemsChangeAndRecalc(index, "mUnit", e.target.value)
                              }
                              className={inputClass(darkMode)}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) =>
                                handleItemsChangeAndRecalc(index, "qty", e.target.value)
                              }
                              className={inputClass(darkMode)}
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            {item.total.toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(index)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove"
                              >
                                ✖
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className={`px-4 py-2 text-sm font-semibold rounded shadow-sm focus:outline-none transition-colors ${
                    darkMode
                      ? "bg-green-700 text-white hover:bg-green-800"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  + Add Row
                </button>
              </div>

              {/* VAT and Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <label className={labelClass(darkMode)}>
                  VAT %
                  <input
                    type="number"
                    value={vatPercent}
                    onChange={handleVatChange}
                    className={inputClass(darkMode)}
                  />
                </label>
                <div className="text-lg font-semibold">
                  Grand Total: {grandTotal.toFixed(2)}
                </div>
              </div>

              {/* Buttons (Cancel + Save) */}
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-500 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isDirty}
                  className={`px-6 py-2 text-white rounded-lg transition-all duration-500 focus:outline-none ${
                    darkMode
                      ? !isDirty
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                      : !isDirty
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg"
                  }`}
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            renderFilledView()
          )}
        </div>
      </main>
    </div>
  );
};

export default BTForm;
