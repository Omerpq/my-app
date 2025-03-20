// src/api/getStockRequestOverview.js
const getStockRequestOverview = async () => {
    const response = await fetch("http://localhost:5000/api/request_stock/overview");
    if (!response.ok) {
      throw new Error("Failed to fetch stock request overview");
    }
    return response.json();
  };
  
  export default getStockRequestOverview;
  