// src/Components/Summaries/QuotationFormSummary.jsx
import React from "react";

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
 * QuotationFormSummary
 * Renders the read-only summary portion from QuotationForm
 */
export default function QuotationFormSummary({
  quotation,        // { date, company, btNo, quoteRef, customerName, customerAddress }
  totalBeforeVat,
  vatPercent,
  vatAmount,
  grandTotal,
  attachment,
  existingFormId,
  baseUrl,
  darkMode
}) {
  return (
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
}
