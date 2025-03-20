// src/components/ThreeDPieChart.jsx
import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Highcharts3DModule from 'highcharts/highcharts-3d.src';

// Initialize Highcharts 3D
if (Highcharts3DModule && typeof Highcharts3DModule.init === 'function') {
  Highcharts3DModule.init(Highcharts);
} else if (typeof Highcharts3DModule === 'function') {
  Highcharts3DModule(Highcharts);
} else {
  console.error('Unable to initialize Highcharts 3D (check your version/path).');
}

const ThreeDPieChart = ({ data = [], darkMode }) => {
  const chartRef = useRef(null);

  // State for toggling between Pie and Donut
  const [isDonut, setIsDonut] = useState(false);

  // Convert your data => Highcharts format
  const seriesData = data.map(item => ({
    name: item.status,
    y: item.count
  }));

  // Color array for your slices
  const colors = [
    'rgba(0,123,255,0.9)', // Active (blue)
    'rgba(40,167,69,0.9)', // Completed (green)
    'rgba(255,69,0,0.9)'   // Overdue (red)
  ];

  // Build the Highcharts options object
  const options = {
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0,
        depth: 50
      },
      backgroundColor: darkMode ? '#1f2937' : '#ffffff'
    },
    credits: { enabled: false },
    accessibility: { enabled: false },
    title: {
      text: 'Projects by Status (3D)',
      style: {
        color: darkMode ? '#e2e8f0' : '#1f2937',
        fontSize: '20px',
        fontWeight: 'bold'
      }
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 50,
        // If isDonut is true => 50% inner size, else => 0% (normal pie)
        innerSize: isDonut ? '50%' : '0%',
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.percentage:.1f} %',
          style: {
            fontSize: '14px',
            color: darkMode ? '#e2e8f0' : '#1f2937'
          }
        },
        borderColor: '#ffffff',
        borderWidth: 1,
        // Glow effect using a bright shadow
        shadow: {
          enabled: true,
          color: 'rgba(255,255,255,0.6)', // bright glow color
          offsetX: 0,
          offsetY: 0,
          width: 15
        }
      }
    },
    series: [
      {
        name: 'Projects',
        data: seriesData,
        colors
      }
    ]
  };

  // Reflow on darkMode changes
  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      chartRef.current.chart.reflow();
    }
  }, [darkMode]);

  return (
    <div style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
      {/* Toggle Switch for Pie / Donut */}
      <div className="flex justify-end mb-2">
        <label className="flex items-center cursor-pointer">
          <span
            className={`mr-2 font-semibold ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {isDonut ? 'Donut' : 'Pie'}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isDonut}
              onChange={() => setIsDonut(!isDonut)}
            />
            <div
              className={`block w-10 h-6 rounded-full transition-all ${
                isDonut ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gray-400'
              }`}
            ></div>
            <div
              className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${
                isDonut ? 'translate-x-4' : 'translate-x-1'
              }`}
            ></div>
          </div>
        </label>
      </div>

      {/* The Chart Itself */}
      <div ref={chartRef} style={{ height: '400px' }}>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export default ThreeDPieChart;
