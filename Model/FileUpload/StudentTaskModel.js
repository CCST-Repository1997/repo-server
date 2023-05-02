const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentTaskSchema = new Schema({
    fileName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    uploader_id: {
        type: String,
        required: true
    },
    task_id: {
        type: String,
        required: true
    },
    progress_id: {
        type: String,
        required: true
    },
    group_id: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true
    }
}, { timestamps: true});
// timestamps - makes a "createdAt" and "updatedAt" everytime we create a workout.


module.exports = mongoose.model('StudentTaskFiles', studentTaskSchema );