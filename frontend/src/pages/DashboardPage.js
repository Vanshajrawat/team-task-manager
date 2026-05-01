import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/Dashboard.css';

function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      
      // Fetch stats for each project
      const statsMap = {};
      for (const project of res.data) {
        try {
          const statsRes = await api.get(`/tasks/project/${project._id}/stats`);
          statsMap[project._id] = statsRes.data;
        } catch (err) {
          statsMap[project._id] = null;
        }
      }
      setStats(statsMap);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', {
        name: newProjectName,
        description: newProjectDesc
      });
      setProjects([...projects, res.data]);
      setShowModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p._id !== projectId));
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Team Task Manager</h1>
        </div>
        <div className="header-right">
          <span>Welcome, {user?.name}!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="projects-header">
          <h2>Your Projects</h2>
          <button onClick={() => setShowModal(true)} className="create-btn">+ New Project</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Create New Project</h3>
              <form onSubmit={handleCreateProject}>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Project Description"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows="4"
                />
                <div className="modal-buttons">
                  <button type="submit" className="btn-primary">Create</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="projects-grid">
          {projects.length === 0 ? (
            <p className="no-projects">No projects yet. Create one to get started!</p>
          ) : (
            projects.map(project => {
              const projectStats = stats[project._id];
              return (
                <div key={project._id} className="project-card">
                  <h3>{project.name}</h3>
                  <p className="project-desc">{project.description}</p>
                  
                  {projectStats ? (
                    <div className="project-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Tasks</span>
                        <span className="stat-value">{projectStats.totalTasks}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">To Do</span>
                        <span className="stat-value">{projectStats.tasksByStatus['To Do']}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">In Progress</span>
                        <span className="stat-value">{projectStats.tasksByStatus['In Progress']}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Done</span>
                        <span className="stat-value">{projectStats.tasksByStatus['Done']}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Overdue</span>
                        <span className="stat-value" style={{ color: projectStats.overdueTasks > 0 ? '#d32f2f' : '#4caf50' }}>
                          {projectStats.overdueTasks}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="project-meta">
                    <small>Members: {project.members.length}</small>
                    <small>Role: {project.admin._id === user._id ? 'Admin' : 'Member'}</small>
                  </div>
                  
                  <div className="project-actions">
                    <button 
                      onClick={() => navigate(`/project/${project._id}`)}
                      className="btn-primary"
                    >
                      View
                    </button>
                    {project.admin._id === user._id && (
                      <button 
                        onClick={() => handleDeleteProject(project._id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
