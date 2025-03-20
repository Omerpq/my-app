// src/api/getStockRequestOverview.js
const getStockRequestOverview = async () => {
    const response = await fetch("https://my-app-1-uzea.onrender.com/api/request_stock/overview");

    if (!response.ok) {
      throw new Error("Failed to fetch stock request overview");
    }
    return response.json();
  };
  
  export default getStockRequestOverview;
  