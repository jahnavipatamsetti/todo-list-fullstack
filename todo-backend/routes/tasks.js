const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// @route   GET /tasks
// @desc    Get all user's tasks
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /tasks
// @desc    Create a task
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const newTask = await Task.create({
      title,
      description,
      dueDate,
      userId: req.user.id
    });

    res.status(201).json(newTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, completed, dueDate } = req.body;

  try {
    let task = await Task.findOne({ where: { id: req.params.id } });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Make sure user owns task
    if (task.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id } });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Make sure user owns task
    if (task.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.destroy();

    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
