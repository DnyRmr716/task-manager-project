const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    priority: {
        type: String,
        enum: ['Optional', 'Moderate', 'Urgent'],
        required: true
    },
    dueDate: {
        type: Date
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
