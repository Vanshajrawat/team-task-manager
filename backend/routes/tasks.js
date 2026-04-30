const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Create task
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('project').notEmpty().withMessage('Project ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, project, priority, dueDate, assignedTo } = req.body;

    // Check if project exists and user is admin or member
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = projectDoc.members.some(m => m.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const task = new Task({
      title,
      description,
      project,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      createdBy: req.userId
    });

    await task.save();
    await task.populate(['assignedTo', 'createdBy', 'project']);

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate(['assignedTo', 'createdBy', 'project']);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate(['assignedTo', 'createdBy', 'project']);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isAdmin = project.admin.toString() === req.userId;
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.userId;
    
    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, priority, status, dueDate, assignedTo } = req.body;
    
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();
    await task.populate(['assignedTo', 'createdBy', 'project']);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isAdmin = project.admin.toString() === req.userId;
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admin can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/project/:projectId/stats', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tasks = await Task.find({ project: req.params.projectId });

    const totalTasks = tasks.length;
    const tasksByStatus = {
      'To Do': tasks.filter(t => t.status === 'To Do').length,
      'In Progress': tasks.filter(t => t.status === 'In Progress').length,
      'Done': tasks.filter(t => t.status === 'Done').length
    };

    const tasksPerUser = {};
    tasks.forEach(task => {
      if (task.assignedTo) {
        const userId = task.assignedTo.toString();
        tasksPerUser[userId] = (tasksPerUser[userId] || 0) + 1;
      }
    });

    const now = new Date();
    const overdueTasks = tasks.filter(t => 
      t.dueDate && t.dueDate < now && t.status !== 'Done'
    ).length;

    res.json({
      totalTasks,
      tasksByStatus,
      tasksPerUser,
      overdueTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
