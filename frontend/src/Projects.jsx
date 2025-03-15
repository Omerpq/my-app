// src/Projects.jsx
import React, { useEffect, useState } from "react";
import { getProjects, deleteProject } from "./api";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
    } catch (err) {
      alert("Failed to delete project: " + err.message);
    }
  };

  return (
    <div>
      <h1>Projects</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {projects.length === 0 ? (
        <p>No projects available.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Project Job ID</th>
              <th>Quotation Number</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>{project.project_job_id}</td>
                <td>{project.quotation_number}</td>
                <td>{project.address}</td>
                <td>{project.status}</td>
                <td>
                  <button onClick={() => navigate(`/projects/${project.id}`)}>View</button>
                  <button onClick={() => handleDelete(project.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Projects;
