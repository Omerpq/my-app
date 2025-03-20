// src/components/StockRequestOverviewChart.jsx
import React from "react";
import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d.src";
import HighchartsReact from "highcharts-react-official";

// Initialize Highcharts 3D
if (typeof Highcharts3D === "function") {
  Highcharts3D(Highcharts);
} else if (Highcharts3D && typeof Highcharts3D.init === "function") {
  Highcharts3D.init(Highcharts);
}

const StockRequestOverviewChart = ({ data = [], darkMode }) => {
  // Convert string fields to numbers
  const categories = data.map((item) => item.urgency);
  const pendingData = data.map((item) => Number(item.pending || 0));
  const approvedData = data.map((item) => Number(item.approved || 0));
  const rejectedData = data.map((item) => Number(item.rejected || 0));

  const options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      animation: {
        duration: 1500,
        easing: "easeOutBounce"
      },
      options3d: {
        enabled: true,
        alpha: 10,       // Slight top-down tilt
        beta: 0,         // No horizontal skew
        depth: 50,       // Moderate column thickness
        viewDistance: 25 // Adjust as needed for perspective
      }
    },
    title: {
      text: "Stock Request Overview",
      style: {
        color: darkMode ? "#ffffff" : "#000000",
        fontWeight: "bold"
      }
    },
    xAxis: {
      categories,
      title: { text: "Urgency" },
      labels: {
        style: { color: darkMode ? "#ffffff" : "#000000" }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "Number of Requests",
        style: { color: darkMode ? "#ffffff" : "#000000" }
      },
      labels: {
        style: { color: darkMode ? "#ffffff" : "#000000" }
      },
      gridLineColor: darkMode
        ? "rgba(255,255,255,0.2)"
        : "rgba(0,0,0,0.1)"
    },
    legend: {
      itemStyle: { color: darkMode ? "#ffffff" : "#000000" }
    },
    plotOptions: {
      column: {
        // Display side-by-side columns (not stacked)
        grouping: true,
        depth: 40, // You can adjust to match your alpha/beta for a nicer look
        borderRadius: 5,
        dataLabels: {
          enabled: true,
          style: { color: darkMode ? "#ffffff" : "#000000" }
        }
      },
      series: {
        animation: {
          duration: 1500,
          easing: "easeOutBounce"
        }
      }
    },
    series: [
      {
        name: "Pending",
        data: pendingData,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "#FFD700"], // bright gold
            [1, "#B8860B"]  // darker gold
          ]
        }
      },
      {
        name: "Approved",
        data: approvedData,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "#32CD32"], // lime green
            [1, "#228B22"]  // forest green
          ]
        }
      },
      {
        name: "Rejected",
        data: rejectedData,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "#FF4500"], // orange red
            [1, "#B22222"]  // firebrick red
          ]
        }
      }
    ],
    credits: { enabled: false }
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      // Ensures a visible chart area for the 3D columns
      containerProps={{ style: { width: "100%", height: "400px" } }}
    />
  );
};

export default StockRequestOverviewChart;
