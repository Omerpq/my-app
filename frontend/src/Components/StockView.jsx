import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const StockView = () => {
  const { darkMode } = useTheme();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${baseUrl}/api/inventory`)
      .then((res) => res.json())
      .then((rawData) => {
        //console.log("Raw inventory data:", rawData); //console log removed
        const mappedData = rawData.map((item) => {
          const latest = item.latestEntry || item.latestentry || item.stock_entry_time;
          return {
            id: item.id,
            itemCode: item.item_code || item.itemCode,
            itemName: item.item_name || item.itemName,
            quantity: item.quantity,
            description: item.description,
            latestEntry: latest ? new Date(latest).toLocaleString() : ""
          };
        });
        //console.log("Mapped inventory data:", mappedData); //removed console log
        setData(mappedData);
      })
      .catch((err) => console.error("Error fetching inventory:", err));
  }, [baseUrl]);

  const filteredData = data.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (term === "") return true;
    const searchIn = `${item.itemCode} ${item.itemName} ${item.quantity} ${item.description}`.toLowerCase();
    return searchIn.includes(term);
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedData = sortField
    ? [...filteredData].sort((a, b) => {
        let fieldA = a[sortField];
        let fieldB = b[sortField];
        if (typeof fieldA === "number" && typeof fieldB === "number") {
          return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
        }
        fieldA = fieldA.toString().toLowerCase();
        fieldB = fieldB.toString().toLowerCase();
        if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      })
    : filteredData;

  const getSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === "asc" ? (
        <span className={`ml-1 font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>↑</span>
      ) : (
        <span className={`ml-1 font-bold ${darkMode ? "text-blue-300" : "text-blue-600"}`}>↓</span>
      );
    }
    return <span className={`ml-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}>↕</span>;
  };

  return (
    <div
      className={`max-w-7xl mx-auto p-8 rounded-xl transition-all duration-500 transform ${
        darkMode
          ? "bg-gray-800 text-white shadow-lg border border-gray-700"
          : "bg-white text-gray-900 shadow-2xl border border-gray-200"
      }`}
    >
      <h1 className="text-3xl font-bold text-center mb-6">Current Stock</h1>
      <div className="mb-4 flex items-center">
        <label className="text-xs font-medium uppercase tracking-wider mr-2">Search:</label>
        <input
          type="text"
          placeholder="Search by code, name, quantity or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-48 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-500 ${
            darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
          }`}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Sr.</th>
              <th
                onClick={() => handleSort("itemCode")}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Item Code{getSortIcon("itemCode")}
              </th>
              <th
                onClick={() => handleSort("itemName")}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Item Name{getSortIcon("itemName")}
              </th>
              <th
                onClick={() => handleSort("quantity")}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Quantity{getSortIcon("quantity")}
              </th>
              <th
                onClick={() => handleSort("description")}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Description{getSortIcon("description")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Entry</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? "divide-gray-600" : "divide-gray-200"}`}>
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-6 py-3 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.itemCode}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.itemName}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.quantity}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.description}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{item.latestEntry}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-3 text-center">
                  No stock records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockView;
