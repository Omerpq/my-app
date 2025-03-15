// src/Components/KeyHandoverForm.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import DarkModeToggle from "./DarkModeToggle";

// -------------- Helpers --------------
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

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

// Reusable input & label styling
const inputClass = (darkMode) => `
  w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500
  ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300 shadow-inner"}
`;
const labelClass = (darkMode) => `
  block font-semibold
  ${darkMode ? "text-gray-300" : "text-gray-700"}
`;

// -------------- Checks/Groups --------------
const CHECK_GROUPS = [
  {
    heading: "Entire Dwelling",
    color: "text-red-500 font-bold",
    items: [
      { section: "VMC Outlets" },
      { section: "Ventilation Grilles" },
      { section: "Floors" },
      { section: "Balcony/Terrace" },
      { section: "Glazing" },
    ],
  },
  {
    heading: "Kitchen",
    color: "text-red-500 font-bold",
    items: [
      { section: "Sink" },
      { section: "Sink Cabinet" },
      { section: "Silicone Seal" },
    ],
  },
  {
    heading: "Sanitary Area",
    color: "text-red-500 font-bold",
    items: [
      { section: "Bathtub" },
      { section: "Washbasin" },
      { section: "Shower" },
      { section: "Bidet" },
      { section: "Silicone Seal" },
    ],
  },
  {
    heading: "Toilet",
    color: "text-red-500 font-bold",
    items: [
      { section: "Clean Bowl" },
      { section: "New Toilet Seat" },
    ],
  },
];

// Flatten them
function buildAllChecks() {
  const all = [];
  for (const group of CHECK_GROUPS) {
    for (const item of group.items) {
      all.push({
        groupHeading: group.heading,
        groupColor: group.color,
        section: item.section,
        isCompliant: false,
        observation: "",
      });
    }
  }
  return all;
}

const INITIAL_CHECKS = buildAllChecks();

const KeyHandoverForm = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { projectId } = useParams();
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  // If a form exists in DB
  const [existingFormId, setExistingFormId] = useState(null);
  // Toggle read-only summary vs. editing mode
  const [isEditing, setIsEditing] = useState(true);

  // Main form fields
  const [formData, setFormData] = useState({
    occupantType: "Pavilion",
    date: "",
    dwellingNUG: "",
    address: "",
    commune: "",
  });

  // The checks array
  const [checks, setChecks] = useState(INITIAL_CHECKS);

  // File attachment
  const [attachment, setAttachment] = useState(null);

  // -------------------------
  // Fetch existing form
  // -------------------------
  useEffect(() => {
    if (!projectId) return;

    const fetchExistingForm = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/projects/forms/${projectId}`);
        if (!res.ok) return;

        const formsArray = await res.json();
        const record = formsArray.find(
          (f) => (f.form_type || "").trim().toLowerCase() === "key-handover-form"
        );
        if (!record) return;

        setExistingFormId(record.id);

        // parse form_data
        let data = record.form_data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (err) {
            console.error("Error parsing form_data:", err);
          }
        }

        setFormData({
          occupantType: data.occupantType || "Pavilion",
          date: data.date || "",
          dwellingNUG: data.dwellingNUG || "",
          address: data.address || "",
          commune: data.commune || "",
        });

        if (data.checks && Array.isArray(data.checks)) {
          setChecks(data.checks);
        }

        // file
        if (record.attached_files && record.attached_files.length > 0) {
          const meta = data.filesMetadata && data.filesMetadata[0];
          setAttachment({
            name: meta?.name || "(existing file)",
            type: meta?.mimeType || "application/octet-stream",
            size: meta?.size || 0,
            data: null,
          });
        }

        setIsEditing(false);
      } catch (error) {
        console.error("Error fetching Key Handover Form:", error);
      }
    };

    fetchExistingForm();
  }, [projectId, baseUrl]);

  // -------------------------
  // Handlers
  // -------------------------
  const handleTypeToggle = (type) => {
    setFormData((prev) => ({ ...prev, occupantType: type }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle C / NC
  const handleCheckToggle = (index) => {
    setChecks((prev) => {
      const newChecks = [...prev];
      newChecks[index].isCompliant = !newChecks[index].isCompliant;
      return newChecks;
    });
  };

  // Observations
  const handleObservationChange = (index, value) => {
    setChecks((prev) => {
      const newChecks = [...prev];
      newChecks[index].observation = value;
      return newChecks;
    });
  };

  // File
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

  // Cancel
  const handleCancel = () => {
    if (existingFormId) {
      setIsEditing(false);
    } else {
      setFormData({
        occupantType: "Pavilion",
        date: "",
        dwellingNUG: "",
        address: "",
        commune: "",
      });
      setChecks(INITIAL_CHECKS);
      setAttachment(null);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = {
      occupantType: formData.occupantType,
      date: formData.date,
      dwellingNUG: formData.dwellingNUG,
      address: formData.address,
      commune: formData.commune,
      checks,
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
        form_type: "key-handover-form",
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
        const msg = await response.text();
        console.error("Error saving Key Handover Form:", msg);
        alert("Failed to save Key Handover Form!");
        return;
      }
      const savedRecord = await response.json();
      console.log("Key Handover Form saved:", savedRecord);

      if (!existingFormId && savedRecord.id) {
        setExistingFormId(savedRecord.id);
      }
      alert("Key Handover Form submitted & stored in DB!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving Key Handover Form:", error);
      alert("Failed to save Key Handover Form!");
    }
  };

  // -------------------------
  // Read-Only Summary
  // -------------------------
  const renderSummary = () => {
    const grouped = {};
    checks.forEach((c) => {
      if (!grouped[c.groupHeading]) {
        grouped[c.groupHeading] = [];
      }
      grouped[c.groupHeading].push(c);
    });

    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold mb-4">Key Handover Summary</h3>
        <div
          className={`${
            darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
          } p-6 rounded-lg shadow-lg`}
        >
          <p>
            <strong>Type:</strong> {formData.occupantType}
          </p>
          <p>
            <strong>Date:</strong> {formData.date || "N/A"}
          </p>
          <p>
            <strong>Dwelling NUG:</strong> {formData.dwellingNUG || "N/A"}
          </p>
          <p>
            <strong>Address:</strong> {formData.address || "N/A"}
          </p>
          <p>
            <strong>Commune:</strong> {formData.commune || "N/A"}
          </p>

          <hr className="my-4" />

          {Object.keys(grouped).map((heading) => (
            <div key={heading} className="mb-6">
              <h4 className="text-red-500 font-bold mb-2">{heading}</h4>
              <ul className="space-y-2">
                {grouped[heading].map((item, i) => (
                  <li key={i}>
                    <strong>{item.section}:</strong> {item.isCompliant ? "C" : "NC"}
                    {item.observation && (
                      <p className="text-sm italic mt-1">
                        <strong>Observations:</strong> {item.observation}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {attachment && (
            <div className="mt-4">
              <p>
                <strong>File:</strong> {attachment.name} <br />
                <strong>Type:</strong> {attachment.type} <br />
                <strong>Size:</strong> {formatBytes(attachment.size)}
              </p>
              {existingFormId && (
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
  };

  // -------------------------
  // Main Render
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
        <div className="text-xl font-semibold">Key Handover Form</div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className={`text-sm ${darkMode ? "text-yellow-600" : "text-gray-500"}`}>
              {user?.role}
            </span>
            <span className="text-xs">{user?.name}</span>
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
            Key Handover for Project {projectId || "N/A"}
          </h2>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Occupant Type Toggle */}
              <div className="flex items-center gap-4">
                <label className={labelClass(darkMode)}>Type:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeToggle("Pavilion")}
                    className={`px-3 py-1 rounded ${
                      formData.occupantType === "Pavilion"
                        ? darkMode
                          ? "bg-green-700 hover:bg-green-800 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                        : darkMode
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-black"
                    }`}
                  >
                    Pavilion
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeToggle("Apartment")}
                    className={`px-3 py-1 rounded ${
                      formData.occupantType === "Apartment"
                        ? darkMode
                          ? "bg-green-700 hover:bg-green-800 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                        : darkMode
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-black"
                    }`}
                  >
                    Apartment
                  </button>
                </div>
              </div>

              {/* File Attachment */}
              <div>
                <label className={labelClass(darkMode)}>File Attachment:</label>
                <input type="file" onChange={handleFileChange} className="mt-2" />
                {attachment && (
                  <p className="text-xs mt-1 text-green-400">
                    Attached: {attachment.name} ({formatBytes(attachment.size)})
                  </p>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass(darkMode)}>
                    Date
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
                <div>
                  <label className={labelClass(darkMode)}>
                    Dwelling NUG
                    <input
                      type="text"
                      name="dwellingNUG"
                      value={formData.dwellingNUG}
                      onChange={handleInputChange}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
                <div>
                  <label className={labelClass(darkMode)}>
                    Address
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
                <div>
                  <label className={labelClass(darkMode)}>
                    Commune
                    <input
                      type="text"
                      name="commune"
                      value={formData.commune}
                      onChange={handleInputChange}
                      className={inputClass(darkMode)}
                    />
                  </label>
                </div>
              </div>

              {/* Grouped Checks */}
              {CHECK_GROUPS.map((group) => {
                const groupChecks = checks.filter(
                  (c) => c.groupHeading === group.heading
                );

                return (
                  <div key={group.heading} className="mt-6">
                    <h3 className={`${group.color} mb-2 text-lg`}>{group.heading}</h3>
                    {Array.from({
                      length: Math.ceil(groupChecks.length / 3),
                    }).map((_, rowIndex) => {
                      const start = rowIndex * 3;
                      const rowItems = groupChecks.slice(start, start + 3);
                      return (
                        <div
                          key={rowIndex}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
                        >
                          {rowItems.map((item) => {
                            const checkIndex = checks.findIndex(
                              (ch) =>
                                ch.section === item.section &&
                                ch.groupHeading === item.groupHeading
                            );
                            return (
                              <div key={item.section} className="p-2 rounded border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold">
                                    {item.section}
                                  </span>
                                  <button
                                    type="button"
                                    style={{ pointerEvents: "auto", zIndex: 9999 }}
                                    onClick={() => handleCheckToggle(checkIndex)}
                                    className={`px-3 py-1 rounded text-sm ${
                                      item.isCompliant
                                        ? darkMode
                                          ? "bg-green-700 hover:bg-green-800 text-white"
                                          : "bg-green-500 hover:bg-green-600 text-white"
                                        : darkMode
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-red-500 hover:bg-red-600 text-white"
                                    }`}
                                  >
                                    {item.isCompliant ? "C" : "NC"}
                                  </button>
                                </div>
                                <textarea
                                  value={item.observation}
                                  onChange={(e) =>
                                    handleObservationChange(checkIndex, e.target.value)
                                  }
                                  className={`${inputClass(darkMode)} h-16 text-sm`}
                                  placeholder="Observations / Corrective Actions"
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

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
            renderSummary()
          )}
        </div>
      </main>
    </div>
  );
};

export default KeyHandoverForm;
