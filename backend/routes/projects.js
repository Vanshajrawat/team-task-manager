const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create project
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Project name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

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
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all user projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      'members.userId': req.userId
    }).populate(['admin', 'members.userId']);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(['admin', 'members.userId']);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is member
    const isMember = project.members.some(m => m.userId._id.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
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

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to project
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email, role } = req.body;

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
      return res.status(400).json({ message: 'User already member' });
    }

    project.members.push({ userId: user._id, role: role || 'Member' });
    await project.save();
    await project.populate(['admin', 'members.userId']);

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from project
router.delete('/:id/members/:memberId', auth, async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
