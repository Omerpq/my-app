// src/Components/Summaries/BTFormSummary.jsx
import React from "react";

// Minimal helper
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
 * BTFormSummary
 * Renders the read-only summary portion that was in "renderFilledView"
 */
export default function BTFormSummary({
  sender,
  workOrder,
  period,
  grandTotal,
  attachment,
  existingFormId,
  baseUrl,
  darkMode
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-4">BT Form Summary</h3>
      <div
        className={`${
          darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
        } p-6 rounded-lg shadow-lg`}
      >
        <p>
          <strong>Sender Name:</strong> {sender?.name || "N/A"}
        </p>
        <p>
          <strong>Sender Address:</strong> {sender?.address || "N/A"}
        </p>
        <p>
          <strong>Customer:</strong> {workOrder?.customer || "N/A"}
        </p>
        <p>
          <strong>Work Order Date:</strong> {workOrder?.date || "N/A"}
        </p>
        <p>
          <strong>Period:</strong>{" "}
          {period?.start ? `${period.start} to ${period.end || "N/A"}` : "N/A"}
        </p>
        <p>
          <strong>Grand Total:</strong>{" "}
          {grandTotal != null ? grandTotal.toFixed(2) : "0.00"}
        </p>

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
