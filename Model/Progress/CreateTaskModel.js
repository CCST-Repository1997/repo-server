const mongoose = require('mongoose');

// Schema
const Schema = mongoose.Schema;

const tasksSchema = new Schema({
    taskName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    chapter:{
        type: String,
        required: true
    },
    group_id: {
        type: String,
        required: true
    },
    checkboxStatus: {
        type: Boolean,
        required: true
    },
    progress_id: {
        type: String,
        required: true
    }
}, { timestamps: true});
// timestamps - makes a "createdAt" and "updatedAt" everytime we create a workout.


module.exports = mongoose.model('ProgressTasks', tasksSchema);