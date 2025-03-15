// src/Components/QuotationForm.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import DarkModeToggle from "./DarkModeToggle";

// -------------------------
// Helper: Convert ArrayBuffer -> Base64
// -------------------------
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Format bytes into e.g. "12.34 KB"
function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

// Reusable styles
const inputClass = (darkMode) => `
  w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500
  ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300 shadow-inner"}
`;
const labelClass = (darkMode) => `
  block font-semibold
  ${darkMode ? "text-gray-300" : "text-gray-700"}
`;

const QuotationForm = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { projectId } = useParams(); // projectId is the job_id
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  // Project details
  const [project, setProject] = useState(null);

  // If a form already exists
  const [existingFormId, setExistingFormId] = useState(null);
  // Toggle read-only summary vs. editing
  const [isEditing, setIsEditing] = useState(true);

  // Quotation-level fields
  const [quotation, setQuotation] = useState({
    date: "",
    company: "",
    btNo: "",
    quoteRef: "",
    customerName: "",
    customerAddress: "",
  });

  // Work items
  const [items, setItems] = useState([]);
  const [lineItem, setLineItem] = useState({
    headDetail: "",
    workDetail: "",
    mUnit: "M2",
    rate: 0,
    qty: 1,
  });

  // Totals
  const [totalBeforeVat, setTotalBeforeVat] = useState(0);
  const [vatPercent, setVatPercent] = useState(20);
  const [vatAmount, setVatAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // File Attachment
  const [attachment, setAttachment] = useState(null);

  // -------------------------
  // Fetch project by job_id
  // -------------------------
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/projects/by-job/${projectId}`);
        if (res.ok) {
          const proj = await res.json();
          setProject(proj);
        } else {
          console.error("Failed to fetch project, status:", res.status);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    fetchProject();
  }, [projectId, baseUrl]);

  // -------------------------
  // Fetch existing Quotation Form
  // -------------------------
  useEffect(() => {
    if (!project || !project.job_id) return;

    const fetchQuotationForm = async () => {
      try {
        const url = `${baseUrl}/api/projects/forms/${project.job_id}`;
        const res = await fetch(url);
        if (!res.ok) return;

        const formsArray = await res.json();
        // Filter for "quotation-form"
        const matchingForms = formsArray.filter(
          (f) => (f.form_type || "").trim().toLowerCase() === "quotation-form"
        );
        if (matchingForms.length === 0) return;

        matchingForms.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const quotationRecord = matchingForms[0];

        if (quotationRecord && quotationRecord.form_data) {
          let data = quotationRecord.form_data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch (err) {
              console.error("Error parsing form_data:", err);
            }
          }
          setExistingFormId(quotationRecord.id);

          // Load
          setQuotation({
            date: data.quotation?.date || "",
            company: data.quotation?.company || "",
            btNo: data.quotation?.btNo || "",
            quoteRef: data.quotation?.quoteRef || "",
            customerName: data.quotation?.customerName || "",
            customerAddress: data.quotation?.customerAddress || "",
          });
          setItems(data.items || []);
          setTotalBeforeVat(data.totalBeforeVat || 0);
          setVatPercent(data.vatPercent ?? 20);
          setVatAmount(data.vatAmount ?? 0);
          setGrandTotal(data.grandTotal ?? 0);

          // File
          if (
            quotationRecord.attached_files &&
            quotationRecord.attached_files.length > 0
          ) {
            const meta = data.filesMetadata && data.filesMetadata[0];
            setAttachment({
              name: meta?.name || "(existing file)",
              type: meta?.mimeType || "application/octet-stream",
              size: meta?.size || 0,
              data: null,
            });
          }
          setIsEditing(false);
        }
      } catch (error) {
        console.error("Error fetching Quotation Form:", error);
      }
    };

    fetchQuotationForm();
  }, [project, baseUrl]);

  // -------------------------
  // Recalc Totals
  // -------------------------
  const recalcTotals = () => {
    let subTotal = 0;
    items.forEach((item) => {
      const rateVal = parseFloat(item.rate) || 0;
      const qtyVal = parseFloat(item.qty) || 0;
      subTotal += rateVal * qtyVal;
    });
    setTotalBeforeVat(subTotal);
    const vatVal = (subTotal * parseFloat(vatPercent || 0)) / 100;
    setVatAmount(vatVal);
    setGrandTotal(subTotal + vatVal);
  };

  useEffect(() => {
    recalcTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, vatPercent]);

  // -------------------------
  // Handlers
  // -------------------------
  const handleQuotationChange = (e) => {
    const { name, value } = e.target;
    setQuotation((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (e) => {
    const { name, value } = e.target;
    setLineItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLineItem = () => {
    if (!lineItem.headDetail.trim() || !lineItem.workDetail.trim()) {
      alert("Please fill the required fields (Head Detail and Work Detail).");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        headDetail: lineItem.headDetail,
        workDetail: lineItem.workDetail,
        mUnit: lineItem.mUnit,
        rate: parseFloat(lineItem.rate) || 0,
        qty: parseFloat(lineItem.qty) || 1,
      },
    ]);
    setLineItem({ headDetail: "", workDetail: "", mUnit: "M2", rate: 0, qty: 1 });
  };

  const handleRemoveRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    if (!file) {
      setAttachment(null);
      return;
    }
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      const buffer = reader.result;
      const base64String = arrayBufferToBase64(buffer);
      setAttachment({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: buffer.byteLength,
        data: base64String,
      });
    };
  };

  const handleCancel = () => {
    if (existingFormId) {
      setIsEditing(false);
    } else {
      // Clear
      setQuotation({
        date: "",
        company: "",
        btNo: "",
        quoteRef: "",
        customerName: "",
        customerAddress: "",
      });
      setItems([]);
      setLineItem({ headDetail: "", workDetail: "", mUnit: "M2", rate: 0, qty: 1 });
      setTotalBeforeVat(0);
      setVatPercent(20);
      setVatAmount(0);
      setGrandTotal(0);
      setAttachment(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = {
      quotation,
      items,
      totalBeforeVat,
      vatPercent,
      vatAmount,
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
        job_id: project?.job_id || projectId,
        form_type: "quotation-form",
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
        console.error("Error saving Quotation Form:", errMessage);
        alert("Failed to save Quotation Form!");
        return;
      }
      const savedRecord = await response.json();
      console.log("Quotation Form saved:", savedRecord);

      if (!existingFormId && savedRecord.id) {
        setExistingFormId(savedRecord.id);
      }
      alert("Quotation Form submitted & stored in DB!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving Quotation Form:", error);
      alert("Failed to save Quotation Form!");
    }
  };

  // -------------------------
  // Render Summary
  // -------------------------
  const renderFilledView = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4">QUOTATION Summary</h3>
      <div
        className={`${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
        } p-6 rounded-lg shadow-lg`}
      >
        <p><strong>Date:</strong> {quotation.date || "N/A"}</p>
        <p><strong>Company:</strong> {quotation.company || "N/A"}</p>
        <p><strong>BT NO:</strong> {quotation.btNo || "N/A"}</p>
        <p><strong>Quote Reference:</strong> {quotation.quoteRef || "N/A"}</p>
        <p><strong>Customer Name:</strong> {quotation.customerName || "N/A"}</p>
        <p><strong>Customer Address:</strong> {quotation.customerAddress || "N/A"}</p>
        <hr className="my-4" />
        <p><strong>Total (Before VAT):</strong> {totalBeforeVat.toFixed(2)}</p>
        <p><strong>VAT ({vatPercent}%)</strong>: {vatAmount.toFixed(2)}</p>
        <p><strong>Grand Total:</strong> {grandTotal.toFixed(2)}</p>

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

  // -------------------------
  // Main Return
  // -------------------------
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
        <div className="text-xl font-semibold">QUOTATION</div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span
              className={`text-sm ${darkMode ? "text-yellow-600" : "text-gray-500"}`}
            >
              {user?.role}
            </span>
            <span className="text-xs">{user?.name}</span>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      <main className="p-6 transition-all duration-500">
        {/* 
          Minimal logic:
          If isEditing => if there's an existing form => Back = setIsEditing(false), else window.history.back().
          If !isEditing => Back always does window.history.back().
          Also show "Edit Form" if !isEditing and there's an existing form.
        */}
        <div className="mb-12 flex gap-4">
          <button
            onClick={() => {
              if (isEditing) {
                if (existingFormId) {
                  // Already-filled form => go back to summary
                  setIsEditing(false);
                } else {
                  // Brand new form => go back to previous page (likely ViewProjects)
                  window.history.back();
                }
              } else {
                // Not editing => summary => go back to previous route
                window.history.back();
              }
            }}
            className="px-6 py-2 bg-[#ff9933] text-white hover:bg-[#ff7700] rounded-lg shadow-md"
          >
            Back
          </button>

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
            QUOTATION for Project {project?.job_id || projectId || "N/A"}
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

              {/* Quotation Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
                  <label className={labelClass(darkMode)}>
                    Date
                    <input
                      type="date"
                      name="date"
                      value={quotation.date}
                      onChange={handleQuotationChange}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Company
                    <select
                      name="company"
                      value={quotation.company}
                      onChange={handleQuotationChange}
                      className={inputClass(darkMode)}
                    >
                      <option value="">Select</option>
                      <option value="Polsimon">Polsimon</option>
                      <option value="BMJ">BMJ</option>
                      <option value="Sorait">Sorait</option>
                      <option value="Default">Default</option>
                    </select>
                  </label>
                  <label className={labelClass(darkMode)}>
                    BT NO
                    <input
                      type="text"
                      name="btNo"
                      value={quotation.btNo}
                      onChange={handleQuotationChange}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Quote Reference
                    <input
                      type="text"
                      name="quoteRef"
                      value={quotation.quoteRef}
                      onChange={handleQuotationChange}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <label className={labelClass(darkMode)}>
                    Customer Name
                    <input
                      type="text"
                      name="customerName"
                      value={quotation.customerName}
                      onChange={handleQuotationChange}
                      className={inputClass(darkMode)}
                    />
                  </label>
                  <label className={labelClass(darkMode)}>
                    Customer Address
                    <input
                      type="text"
                      name="customerAddress"
                      value={quotation.customerAddress}
                      onChange={handleQuotationChange}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
              </div>

              {/* Line Item Input Area */}
              <div className="space-y-3 mt-6">
                <h3 className="text-lg font-semibold mb-2">Add a Work Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className={labelClass(darkMode)}>Head Detail *</label>
                    <input
                      type="text"
                      name="headDetail"
                      value={lineItem.headDetail}
                      onChange={handleLineItemChange}
                      className={inputClass(darkMode)}
                    />
                  </div>
                  <div>
                    <label className={labelClass(darkMode)}>Work Detail *</label>
                    <input
                      type="text"
                      name="workDetail"
                      value={lineItem.workDetail}
                      onChange={handleLineItemChange}
                      className={inputClass(darkMode)}
                    />
                  </div>
                  <div>
                    <label className={labelClass(darkMode)}>M Unit</label>
                    <select
                      name="mUnit"
                      value={lineItem.mUnit}
                      onChange={handleLineItemChange}
                      className={inputClass(darkMode)}
                    >
                      <option value="M2">M2</option>
                      <option value="ML">ML</option>
                      <option value="NO">NO</option>
                      <option value="EN">EN</option>
                      <option value="U">U</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass(darkMode)}>Rate</label>
                    <input
                      type="number"
                      name="rate"
                      value={lineItem.rate}
                      onChange={handleLineItemChange}
                      className={inputClass(darkMode)}
                    />
                  </div>
                  <div>
                    <label className={labelClass(darkMode)}>Qty</label>
                    <input
                      type="number"
                      min="1"
                      name="qty"
                      value={lineItem.qty}
                      onChange={handleLineItemChange}
                      className={inputClass(darkMode)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className={`px-4 py-2 text-sm font-semibold rounded shadow-sm focus:outline-none transition-colors ${
                    darkMode
                      ? "bg-green-700 text-white hover:bg-green-800"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  +Add
                </button>
              </div>

              {/* Work Items Table */}
              <div className="space-y-3 mt-6">
                <h3 className="text-lg font-semibold mb-2">Work Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse">
                    <thead
                      className={`${
                        darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"
                      }`}
                    >
                      <tr>
                        <th className="px-2 py-2 text-xs">Action</th>
                        <th className="px-2 py-2 text-xs">Head Detail</th>
                        <th className="px-2 py-2 text-xs">Work Detail</th>
                        <th className="px-2 py-2 text-xs">M Unit</th>
                        <th className="px-2 py-2 text-xs">Qty</th>
                        <th className="px-2 py-2 text-xs">Rate</th>
                        <th className="px-2 py-2 text-xs">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => {
                        const rowTotal =
                          (parseFloat(item.rate) || 0) * (parseFloat(item.qty) || 0);
                        return (
                          <tr key={index} className="border-b">
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(index)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove"
                              >
                                ✖
                              </button>
                            </td>
                            <td className="px-2 py-2">{item.headDetail}</td>
                            <td className="px-2 py-2">{item.workDetail}</td>
                            <td className="px-2 py-2">{item.mUnit}</td>
                            <td className="px-2 py-2">{item.qty}</td>
                            <td className="px-2 py-2">{item.rate}</td>
                            <td className="px-2 py-2 text-center">
                              {rowTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-6">
                <div>
                  <label className={labelClass(darkMode)}>Total (Before VAT)</label>
                  <input
                    type="text"
                    value={totalBeforeVat.toFixed(2)}
                    readOnly
                    className={inputClass(darkMode)}
                  />
                </div>
                <div>
                  <label className={labelClass(darkMode)}>VAT (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={vatPercent}
                      onChange={(e) => setVatPercent(e.target.value)}
                      className={`${inputClass(darkMode)} w-20`}
                    />
                    <span className="text-sm font-semibold">
                      = {vatAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelClass(darkMode)}>Grand Total</label>
                  <input
                    type="text"
                    value={grandTotal.toFixed(2)}
                    readOnly
                    className={inputClass(darkMode)}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className={`px-6 py-2 rounded-lg transition-all duration-500 focus:outline-none ${
                    darkMode
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 text-white rounded-lg transition-all duration-500 focus:outline-none ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700"
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

export default QuotationForm;
