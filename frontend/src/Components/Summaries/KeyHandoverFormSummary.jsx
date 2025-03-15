// src/Components/Summaries/KeyHandoverFormSummary.jsx
import React from "react";

// Minimal helper for file size formatting
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

/**
 * KeyHandoverFormSummary
 * Renders the read-only summary for KeyHandoverForm
 */
export default function KeyHandoverFormSummary({
  occupantType,
  date,
  dwellingNUG,
  address,
  commune,
  checks,
  attachment,         // { name, type, size, data }
  existingFormId,
  baseUrl,
  darkMode
}) {
  // Group checks by groupHeading
  const grouped = {};
  (checks || []).forEach((c) => {
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
          <strong>Type:</strong> {occupantType}
        </p>
        <p>
          <strong>Date:</strong> {date || "N/A"}
        </p>
        <p>
          <strong>Dwelling NUG:</strong> {dwellingNUG || "N/A"}
        </p>
        <p>
          <strong>Address:</strong> {address || "N/A"}
        </p>
        <p>
          <strong>Commune:</strong> {commune || "N/A"}
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
}
