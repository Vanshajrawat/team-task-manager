import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/Project.css';

function ProjectPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes, statsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get(`/tasks/project/${id}/stats`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError('Failed to fetch project data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', {
        ...newTaskData,
        project: id
      });
      setTasks([...tasks, res.data]);
      setShowTaskModal(false);
      setNewTaskData({ title: '', description: '', priority: 'Medium', dueDate: '' });
      fetchProjectData();
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, updates);
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
      fetchProjectData();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      fetchProjectData();
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/members`, {
        email: newMemberEmail
      });
      setProject(res.data);
      setShowMemberModal(false);
      setNewMemberEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${memberId}`);
      setProject(res.data);
    } catch (err) {
      setError('Failed to remove member');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!project) return <div className="error">Project not found</div>;

  const isAdmin = project.admin._id === user._id;

  return (
    <div className="project-container">
      <header className="project-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">← Back</button>
        <h1>{project.name}</h1>
        <button onClick={() => navigate('/dashboard')} className="logout-btn">Dashboard</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="project-content">
        <aside className="project-sidebar">
          <div className="sidebar-section">
            <h3>Project Info</h3>
            <p>{project.description}</p>
          </div>

          <div className="sidebar-section">
            <h3>Dashboard Stats</h3>
            {stats && (
              <div className="stats">
                <div className="stat">
                  <span>Total Tasks:</span>
                  <strong>{stats.totalTasks}</strong>
                </div>
                <div className="stat">
                  <span>To Do:</span>
                  <strong>{stats.tasksByStatus['To Do']}</strong>
                </div>
                <div className="stat">
                  <span>In Progress:</span>
                  <strong>{stats.tasksByStatus['In Progress']}</strong>
                </div>
                <div className="stat">
                  <span>Done:</span>
                  <strong>{stats.tasksByStatus['Done']}</strong>
                </div>
                <div className="stat">
                  <span>Overdue:</span>
                  <strong>{stats.overdueTasks}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3>Members ({project.members.length})</h3>
            <div className="members-list">
              {project.members.map(member => (
                <div key={member.userId._id} className="member-item">
                  <span>{member.userId.name}</span>
                  <small>{member.role}</small>
                  {isAdmin && member.userId._id !== user._id && (
                    <button 
                      onClick={() => handleRemoveMember(member.userId._id)}
                      className="remove-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isAdmin && (
              <button onClick={() => setShowMemberModal(true)} className="add-member-btn">
                + Add Member
              </button>
            )}
          </div>
        </aside>

        <main className="project-main">
          <div className="tasks-header">
            <h2>Tasks</h2>
            {isAdmin && (
              <button onClick={() => setShowTaskModal(true)} className="create-btn">
                + New Task
              </button>
            )}
          </div>

          <div className="tasks-list">
            {tasks.length === 0 ? (
              <p className="no-tasks">No tasks yet</p>
            ) : (
              tasks.map(task => (
                <div key={task._id} className="task-item">
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="task-description">{task.description}</p>
                  <div className="task-details">
                    <small>Assigned: {task.assignedTo?.name || 'Unassigned'}</small>
                    {task.dueDate && <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>}
                  </div>
                  <div className="task-actions">
                    <select 
                      value={task.status}
                      onChange={(e) => handleUpdateTask(task._id, { status: e.target.value })}
                      className="status-select"
                    >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteTask(task._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {showTaskModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Task Title"
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Task Description"
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                rows="3"
              />
              <select
                value={newTaskData.priority}
                onChange={(e) => setNewTaskData({...newTaskData, priority: e.target.value})}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <input
                type="date"
                value={newTaskData.dueDate}
                onChange={(e) => setNewTaskData({...newTaskData, dueDate: e.target.value})}
              />
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Create</button>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Member to Project</h3>
            <form onSubmit={handleAddMember}>
              <input
                type="email"
                placeholder="Member Email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Add</button>
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectPage;
