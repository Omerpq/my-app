import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const DynamicForm = () => {
  const { projectId, formId } = useParams();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    // Simulate fetching form data (replace with real API call)
    const storedData = localStorage.getItem(`form-${projectId}-${formId}`);
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
  }, [projectId, formId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">{formId.toUpperCase()} for Project {projectId}</h2>
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-xl">
        {formData ? (
          <>
            <p className="text-lg">Form Data Loaded ✅</p>
            <pre className="bg-gray-100 p-4 rounded-md">{JSON.stringify(formData, null, 2)}</pre>
            <button
              className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg"
              onClick={() => setFormData(null)}
            >
              Edit Form
            </button>
          </>
        ) : (
          <>
            <p className="text-lg">New Form - Please Fill</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newData = { field1: "Sample Data", timestamp: Date.now() };
                localStorage.setItem(`form-${projectId}-${formId}`, JSON.stringify(newData));
                setFormData(newData);
              }}
            >
              <input
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter something..."
                required
              />
              <button type="submit" className="w-full mt-4 py-2 bg-green-500 text-white rounded-lg">
                Save Form
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DynamicForm;
