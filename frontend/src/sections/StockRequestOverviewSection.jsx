// src/sections/StockRequestOverviewSection.jsx
import React from "react";
import DashboardSection from "../components/DashboardSection"; 
import StockRequestOverviewChart from "../components/StockRequestOverviewChart";

const StockRequestOverviewSection = ({ stats, darkMode, french }) => {
  return (
    <DashboardSection
      title={
        french
          ? "Vue d'ensemble des demandes de stock"
          : "Stock Request Overview"
      }
      darkMode={darkMode}
      french={french}
    >
      <StockRequestOverviewChart
        data={stats?.stockRequestData || []}
        darkMode={darkMode}
      />
    </DashboardSection>
  );
};

export default StockRequestOverviewSection;
