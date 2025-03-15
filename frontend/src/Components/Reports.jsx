import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

// Reusable ReportCard component
const ReportCard = ({ title, headers, data, keys }) => {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOpt, setSortOpt] = useState(keys[0]);
  const [sortDir, setSortDir] = useState("asc");

  const toggleSort = () => setSortDir(prev => (prev === "asc" ? "desc" : "asc"));

  // Filter the data based on searchTerm
  const filtered = data.filter(row =>
    keys.some(key => String(row[key]).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort the data
  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortOpt], bv = b[sortOpt];
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div
      className={`p-6 rounded-xl border transition-shadow duration-300 ${
        darkMode
          ? "bg-gray-800 border-gray-700 hover:shadow-xl"
          : "bg-white border-gray-300 hover:shadow-xl"
      }`}
    >
      <h2 className="text-2xl font-semibold mb-3 border-b pb-2">{title}</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center">
          <label className="text-xs font-medium uppercase tracking-wider mr-2">SEARCH:</label>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-48 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          />
        </div>
        <div className="flex items-center mt-2 sm:mt-0">
          <select
            value={sortOpt}
            onChange={(e) => setSortOpt(e.target.value)}
            className={`px-4 py-1 border rounded-lg focus:outline-none transition-all duration-500 w-32 ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          >
            {headers.map((h, i) => (
              <option key={i} value={keys[i]}>
                {h}
              </option>
            ))}
          </select>
          <button onClick={toggleSort} className="px-2 py-1 focus:outline-none" title="Toggle sort direction">
            {sortDir === "asc" ? (
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 15 12 9 18 15" />
                <line x1="6" y1="18" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
                <line x1="6" y1="6" x2="18" y2="6" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="border-b">
              {headers.map((h, i) => (
                <th key={i} className="py-2 px-3 text-left whitespace-normal break-words">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id} className="border-b">
                {keys.map((k, i) => (
                  <td key={i} className="py-2 px-3 whitespace-normal break-words">
                    {row[k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Reports = () => {
  // Replace dummyData with real data from your API if available
  const dummyData = [
    { id: 1, type: "Low Stock Alert", message: "Item SKU002 is below threshold.", date: "2025-02-11 10:00 AM", status: "Critical" },
    { id: 2, type: "Delivery Delay Alert", message: "Delivery for Request #456 is delayed.", date: "2025-02-11 09:00 AM", status: "Warning" },
    { id: 3, type: "Overdue Project Alert", message: "Project ABC is overdue.", date: "2025-02-10 08:00 AM", status: "Overdue" }
  ];

  const headers = ["Type", "Message", "Date", "Status"];
  const keys = ["type", "message", "date", "status"];

  return (
    <div className="p-4">
      <ReportCard title="System Reports" headers={headers} data={dummyData} keys={keys} />
    </div>
  );
};

export default Reports;
