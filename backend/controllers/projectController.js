const Project = require('../models/Project');
const User = require('../models/User');

// Create project
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = new Project({
      name,
      description,
      admin: req.userId,
      members: [{ userId: req.userId, role: 'Admin' }]
    });

    await project.save();
    await project.populate(['admin', 'members.userId']);

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

// Get all user projects
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.userId': req.userId
    }).populate(['admin', 'members.userId']);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(['admin', 'members.userId']);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is member
    const isMember = project.members.some(m => m.userId._id.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    if (project.admin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can update project' });
    }

    const { name, description } = req.body;
    if (name) project.name = name;
    if (description) project.description = description;

    await project.save();
    await project.populate(['admin', 'members.userId']);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating project' });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    if (project.admin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can delete project' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting project' });
  }
};

// Add member to project
exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    if (project.admin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already member
    if (project.members.some(m => m.userId.toString() === user._id.toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({ userId: user._id, role: role || 'Member' });
    await project.save();
    await project.populate(['admin', 'members.userId']);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding member' });
  }
};

// Remove member from project
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    if (project.admin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    project.members = project.members.filter(
      m => m.userId.toString() !== req.params.memberId
    );

    await project.save();
    await project.populate(['admin', 'members.userId']);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error removing member' });
  }
};
