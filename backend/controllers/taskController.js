const Task = require('../models/Task');
const Project = require('../models/Project');

// Create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, priority, dueDate, assignedTo } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project ID are required' });
    }

    // Check if project exists and user is member
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = projectDoc.members.some(m => m.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
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
    res.status(500).json({ message: 'Server error creating task' });
  }
};

// Get tasks for project
exports.getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view tasks' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate(['assignedTo', 'createdBy', 'project']);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate(['assignedTo', 'createdBy', 'project']);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching task' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isAdmin = project.admin.toString() === req.userId;
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.userId;
    
    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
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
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
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

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

// Get project statistics
exports.getProjectStats = async (req, res) => {
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
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};
