const express = require('express');
const router = express.Router();

const Task = require('../models/task.js');

router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/log-in');
    }
    try {
        const foundTasks = await Task.find({ user: req.session.user._id });
        console.log("Retrieved tasks:", foundTasks);
        res.render('index.ejs', {
            tasks: foundTasks || [],
            user: req.session.user,
        });
    } catch (err) {
        console.error("Error retrieving tasks:", err);
        res.status(500).send(err);
    }
});

router.post('/:id', async (req, res) => {
    try {
        const result = await Task.findByIdAndDelete(req.params.id);
        if (!result) {
            console.log("No task found with ID:", req.params.id);
            return res.status(404).send('Task not found.');
        }
        console.log("Task deleted successfully");
        res.redirect('/tasks');
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).send("Failed to delete task.");
    }
});


router.post('/:id/complete', async (req, res) => {
    console.log("Received completion toggle for:", req.params.id);
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            console.error("No task found with ID:", req.params.id);
            return res.status(404).send('Task not found.');
        }

        console.log("Current completion status:", task.isComplete);

        task.isComplete = !task.isComplete;

        await task.save();

        console.log("New completion status:", task.isComplete);

        res.redirect('/tasks');
    } catch (err) {
        console.error("Error updating task completion status:", err);
        res.status(500).send("Failed to update task completion.");
    }
});
  

router.get('/:id/edit', async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      res.render('tasks/edit', { task: task, user: req.session.user });
        } catch (err) {
      console.error("Error retrieving task for edit:", err);
      res.status(500).send("Error retrieving task.");
    }
});

router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const taskUpdates = req.body;
      const updatedTask = await Task.findByIdAndUpdate(id, taskUpdates, { new: true });
      res.redirect('/tasks');
    } catch (err) {
      console.error("Error updating task:", err);
      res.status(500).send("Failed to update task.");
    }
});
  
  

router.get('/new', (req, res) => {
    res.render('tasks/new.ejs', {
      user: req.session.user
    }); 
});

router.post('/', async (req, res) => {
    console.log("Received task data:", req.body); 

    const taskData = {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority, 
        dueDate: req.body.dueDate,
        user: req.session.user._id
    };

    console.log("Task data to save:", taskData); 

    try {
        const createdTask = await Task.create(taskData);
        console.log("Created Task:", createdTask); 
        res.redirect('/tasks');
    } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).send("Error creating task.");
    }
});


module.exports = router;