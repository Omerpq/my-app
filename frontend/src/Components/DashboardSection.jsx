// src/components/DashboardSection.jsx
import React from "react";

const DashboardSection = ({ title, darkMode, french, children, data }) => {
  const sectionBg = darkMode ? "bg-gray-800" : "bg-white";
  const sectionText = darkMode ? "text-white" : "text-black";

  return (
    <section className={`p-6 m-4 rounded-lg shadow-md transition-none ${sectionBg} ${sectionText}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-2">
        {children ? (
          children
        ) : title.toLowerCase().includes("status") || title.toLowerCase().includes("répartition") ? (
          <p>Chart goes here</p>
        ) : (
          <p>
            {french
              ? `Contenu pour ${title} ici.`
              : `Content for ${title} goes here.`}
          </p>
        )}
      </div>
    </section>
  );
};

export default DashboardSection;
