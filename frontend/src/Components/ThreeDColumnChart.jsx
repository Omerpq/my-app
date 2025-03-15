import React from "react";
import Highcharts from "highcharts";
import "highcharts/highcharts-3d";
import HighchartsReact from "highcharts-react-official";

const ThreeDColumnChart = ({ data = [], darkMode }) => {
  const categories = data.map((item) => item.item_name);
  const seriesData = data.map((item) => Number(item.quantity || 0));

  // Vivid gradient palette: each object is a 2-stop gradient from a bright color to a darker variant
  const vividGradients = [
    // 1) Bright Red
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, "#f94144"], // top (brighter)
        [1, "#c21e1d"]  // bottom (darker)
      ]
    },
    // 2) Bright Orange
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, "#f3722c"],
        [1, "#c15618"]
      ]
    },
    // 3) Bright Gold
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, "#f8961e"],
        [1, "#c67406"]
      ]
    },
    // 4) Warm Orange
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, "#f9844a"],
        [1, "#c8622e"]
      ]
    },
    // 5) Vivid Yellow
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, "#f9c74f"],
        [1, "#c9a231"]
      ]
    },
    // 6) Bright Green
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, "#90be6d"],
        [1, "#6b993c"]
      ]
    },
    // 7) Teal Green
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, "#43aa8b"],
        [1, "#2d876d"]
      ]
    },
    // 8) Slate Blue
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, "#577590"],
        [1, "#3a5164"]
      ]
    },
    // 9) Azure
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, "#277da1"],
        [1, "#1b5b72"]
      ]
    },
    // 10) Vivid Blue
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, "#4c6ef5"],
        [1, "#2b49b3"]
      ]
    }
  ];

  const options = {
    chart: {
      type: "column",
      backgroundColor: "transparent", // match container
      height: 400,
      options3d: {
        enabled: true,
        alpha: 10,
        beta: 15,
        depth: 70,
        viewDistance: 25,
        frame: {
          bottom: { size: 1, color: "transparent" },
          back: { size: 1, color: "transparent" },
          side: { size: 1, color: "transparent" }
        }
      },
      marginTop: 80,
      marginBottom: 80,
      marginLeft: 80,
      marginRight: 80
    },

    // Apply our vivid gradient palette
    colors: vividGradients,

    title: {
      text: "Current Inventory Levels",
      style: {
        color: darkMode ? "#ffffff" : "#000000",
        fontWeight: "bold"
      }
    },
    xAxis: {
      categories,
      labels: {
        style: {
          color: darkMode ? "#ffffff" : "#000000"
        }
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: "Inventory Level",
        style: {
          color: darkMode ? "#ffffff" : "#000000"
        }
      },
      labels: {
        style: {
          color: darkMode ? "#ffffff" : "#000000"
        }
      },
      gridLineColor: darkMode
        ? "rgba(255,255,255,0.2)"
        : "rgba(0,0,0,0.1)"
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      // colorByPoint => each column uses the next gradient from "colors"
      series: {
        colorByPoint: true,
        animation: { duration: 1500 }
      },
      column: {
        depth: 40,
        pointWidth: 30,
        groupPadding: 0.1,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          style: {
            color: darkMode ? "#ffffff" : "#000000"
          }
        }
      }
    },
    series: [
      {
        name: "Inventory Level",
        data: seriesData
      }
    ],
    credits: {
      enabled: false
    }
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default ThreeDColumnChart;
