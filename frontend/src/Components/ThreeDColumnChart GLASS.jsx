import React from "react";
import Highcharts from "highcharts";
import "highcharts/highcharts-3d";
import HighchartsReact from "highcharts-react-official";

const ThreeDColumnChart = ({ data = [], darkMode }) => {
  const categories = data.map((item) => item.item_name);
  const seriesData = data.map((item) => Number(item.quantity || 0));

  // Example: each gradient uses partial alpha (rgba) stops.
  // The top is brighter and more opaque; the bottom is darker and more transparent.
  // Tweak the colors/alphas to match your brand or create a "frosted" look.
  const glassGradients = [
    // Column 1: light red glass
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0,   "rgba(255, 150, 150, 0.9)"],  // near top: fairly opaque
        [0.4, "rgba(255, 0,   0,   0.3)"],  // mid: partial see-through
        [1,   "rgba(255, 255, 255, 0.1)"]   // bottom: faintly visible
      ]
    },
    // Column 2: light orange glass
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0,   "rgba(255, 210, 150, 0.9)"],
        [0.4, "rgba(255, 128,   0, 0.3)"],
        [1,   "rgba(255, 255, 255, 0.1)"]
      ]
    },
    // Column 3: light yellow glass
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0,   "rgba(255, 255, 150, 0.9)"],
        [0.4, "rgba(255, 255,   0, 0.3)"],
        [1,   "rgba(255, 255, 255, 0.1)"]
      ]
    },
    // Column 4: light green glass
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0,   "rgba(150, 255, 150, 0.9)"],
        [0.4, "rgba(  0, 255,   0, 0.3)"],
        [1,   "rgba(255, 255, 255, 0.1)"]
      ]
    },
    // Column 5: light blue glass
    {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0,   "rgba(150, 150, 255, 0.9)"],
        [0.4, "rgba(  0,   0, 255, 0.3)"],
        [1,   "rgba(255, 255, 255, 0.1)"]
      ]
    }
  ];

  const options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
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

    // Provide our semi-transparent "glass" gradients here:
    colors: glassGradients,

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
      series: {
        // 1) colorByPoint => each column uses the next gradient from `colors`
        colorByPoint: true,
        animation: { duration: 1500 }
      },
      column: {
        depth: 40,
        pointWidth: 30,
        groupPadding: 0.1,
        borderWidth: 0,
        // 2) optional: set overall column opacity
        // opacity: 0.8, // e.g., to make them more translucent
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
