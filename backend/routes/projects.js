const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Create project
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Project name is required')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, projectController.createProject);

// Get all user projects
router.get('/', auth, projectController.getUserProjects);

// Get project by ID
router.get('/:id', auth, projectController.getProjectById);

// Update project
router.put('/:id', auth, projectController.updateProject);

// Delete project
router.delete('/:id', auth, projectController.deleteProject);

// Add member to project
router.post('/:id/members', auth, projectController.addMember);

// Remove member from project
router.delete('/:id/members/:memberId', auth, projectController.removeMember);

module.exports = router;
