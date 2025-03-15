// src/Components/ProjectSummary.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import DarkModeToggle from "./DarkModeToggle";

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

export default function ProjectSummary() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  const { darkMode } = useTheme();
  const { user } = useAuth();

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    const fetchForms = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/projects/forms/${projectId}`);
        if (!res.ok) {
          console.error("Error fetching forms, status:", res.status);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setForms(data);
      } catch (error) {
        console.error("Error fetching forms for summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [projectId, baseUrl]);

  function parseFormData(strOrObj) {
    if (!strOrObj) return {};
    if (typeof strOrObj === "string") {
      try {
        return JSON.parse(strOrObj);
      } catch (err) {
        console.error("Error parsing form_data:", err);
        return {};
      }
    }
    return strOrObj;
  }

  function normalizeType(typeStr) {
    return (typeStr || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function renderTwoColumns(pairs) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6 ml-2">
        {pairs.map(({ label, value }) => (
          <div key={label} className="flex items-start text-sm">
            <strong className="mr-1">{label}:</strong>
            <span>{value}</span>
          </div>
        ))}
      </div>
    );
  }

  // BT Form snippet
  function renderBTFormSnippet(data) {
    const senderName = data.sender?.name || "N/A";
    const senderAddress = data.sender?.address || "N/A";
    const customer = data.workOrder?.customer || "N/A";
    const workOrderDate = data.workOrder?.date || "N/A";
    const periodStart = data.period?.start || "N/A";
    const periodEnd = data.period?.end || "N/A";
    const grandTotal =
      data.grandTotal != null ? Number(data.grandTotal).toFixed(2) : "0.00";

    const pairs = [
      { label: "Sender Name", value: senderName },
      { label: "Sender Address", value: senderAddress },
      { label: "Customer", value: customer },
      { label: "Work Order Date", value: workOrderDate },
      { label: "Period", value: `${periodStart} to ${periodEnd}` },
      { label: "Grand Total", value: grandTotal },
    ];
    return renderTwoColumns(pairs);
  }

  // Quotation snippet
  function renderQuotationFormSnippet(data) {
    const date = data.quotation?.date || "N/A";
    const company = data.quotation?.company || "N/A";
    const btNo = data.quotation?.btNo || "N/A";
    const quoteRef = data.quotation?.quoteRef || "N/A";
    const custName = data.quotation?.customerName || "N/A";
    const custAddr = data.quotation?.customerAddress || "N/A";
    const grandTotal =
      data.grandTotal != null ? Number(data.grandTotal).toFixed(2) : "0.00";

    const pairs = [
      { label: "Date", value: date },
      { label: "Company", value: company },
      { label: "BT No", value: btNo },
      { label: "Quote Ref", value: quoteRef },
      { label: "Customer Name", value: custName },
      { label: "Customer Address", value: custAddr },
      { label: "Grand Total", value: grandTotal },
    ];
    return renderTwoColumns(pairs);
  }

  // Key Handover snippet
  function renderKeyHandoverSnippet(data) {
    const occupantType = data.occupantType || "N/A";
    const date = data.date || "N/A";
    const dwellingNUG = data.dwellingNUG || "N/A";
    const address = data.address || "N/A";
    const commune = data.commune || "N/A";
    const checksCount = Array.isArray(data.checks) ? data.checks.length : 0;

    const pairs = [
      { label: "Type", value: occupantType },
      { label: "Date", value: date },
      { label: "Dwelling NUG", value: dwellingNUG },
      { label: "Address", value: address },
      { label: "Commune", value: commune },
      { label: "Checks", value: `${checksCount} item(s)` },
    ];
    return renderTwoColumns(pairs);
  }

  // Starting snippet
  function renderStartingFormSnippet(data) {
    const date = data.date || "N/A";
    const manager = data.manager || "N/A";
    const notes = data.notes || "N/A";

    const pairs = [
      { label: "Date", value: date },
      { label: "Manager", value: manager },
      { label: "Notes", value: notes },
    ];
    return renderTwoColumns(pairs);
  }

  // Measuring snippet
  function renderMeasuringFormSnippet(data) {
    const measureDate = data.measureDate || "N/A";
    const measureBy = data.measureBy || "N/A";
    const siteAddress = data.siteAddress || "N/A";

    const pairs = [
      { label: "Measure Date", value: measureDate },
      { label: "Measured By", value: measureBy },
      { label: "Site Address", value: siteAddress },
    ];
    return renderTwoColumns(pairs);
  }

  function renderSnippet(formId, data) {
    switch (formId) {
      case "bt-form":
        return renderBTFormSnippet(data);
      case "quotation-form":
        return renderQuotationFormSnippet(data);
      case "key-handover-form":
        return renderKeyHandoverSnippet(data);
      case "starting-form":
        return renderStartingFormSnippet(data);
      case "measuring-form":
        return renderMeasuringFormSnippet(data);
      default:
        return <div className="italic text-sm">No snippet defined.</div>;
    }
  }

  const handleAddOrEdit = (formDef) => {
    navigate(`/projects/${projectId}/forms/${formDef.id}`, {
      state: { directEdit: true },
    });
  };

  // Use the same style as the "View Projects" button
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold">Loading summary...</h2>
      </div>
    );
  }

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
        <div className="text-xl font-semibold">Project Summary</div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span
              className={`text-sm ${
                darkMode ? "text-yellow-600" : "text-gray-500"
              }`}
            >
              {user?.role}
            </span>
            <span className="text-xs">{user?.name}</span>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      <main className="p-6 transition-all duration-500">
        {/* Top row: Back button + centered heading */}
        <div className="flex items-center justify-center relative mb-6">
          {/* "Back" button on the left, same style as "View Projects" */}
          <button
            onClick={handleBack}
            className="absolute left-0 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md"
          >
            Back
          </button>
          {/* Centered heading */}
          <h1 className="text-3xl font-bold text-center">
            Summary: Project {projectId}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALL_FORMS.map((formDef) => {
            const record = forms.find(
              (f) => normalizeType(f.form_type) === formDef.id
            );

            if (!record) {
              // Not added => "Add Form"
              return (
                <div
                  key={formDef.id}
                  className={`border rounded p-4 shadow-sm space-y-2 ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h2 className="text-xl font-semibold">{formDef.name}</h2>
                  <p className="text-sm italic text-gray-500">Not added yet</p>
                  <button
                    onClick={() => handleAddOrEdit(formDef)}
                    className={`px-4 py-1 text-white rounded text-sm ${formColors[formDef.id]}`}
                  >
                    Add Form
                  </button>
                </div>
              );
            }

            // parse
            const data = parseFormData(record.form_data);
            const snippet = renderSnippet(formDef.id, data);

            // handle attached files
            const hasFiles =
              record.attached_files &&
              record.attached_files.length > 0 &&
              data.filesMetadata;

            return (
              <div
                key={record.id}
                className={`border rounded p-4 shadow-sm space-y-2 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h2 className="text-xl font-semibold">{formDef.name}</h2>

                <div
                  className={`text-sm p-2 rounded overflow-x-auto ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {snippet}
                </div>

                {hasFiles ? (
                  <div>
                    <h3 className="text-sm font-bold mt-2">Attached Files:</h3>
                    {record.attached_files.map((_, idx) => {
                      const meta = data.filesMetadata[idx];
                      return (
                        <div key={idx} className="mb-1">
                          <a
                            href={`${baseUrl}/api/projects/forms/${record.id}/file/${idx}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-600"
                          >
                            {meta?.name || `File #${idx + 1}`}
                          </a>
                          {meta?.mimeType && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({meta.mimeType})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs italic text-gray-500">
                    No attached files
                  </p>
                )}

                <button
                  onClick={() => handleAddOrEdit(formDef)}
                  className={`px-3 py-1 text-white rounded text-sm ${formColors[formDef.id]}`}
                >
                  Edit Form
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
