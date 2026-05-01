const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

// Create task
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('project').notEmpty().withMessage('Project ID is required')
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, taskController.createTask);

// Get tasks for project
router.get('/project/:projectId', auth, taskController.getTasksByProject);

// Get task by ID
router.get('/:id', auth, taskController.getTaskById);

// Update task
router.put('/:id', auth, taskController.updateTask);

// Delete task
router.delete('/:id', auth, taskController.deleteTask);

// Get project statistics
router.get('/project/:projectId/stats', auth, taskController.getProjectStats);

module.exports = router;
