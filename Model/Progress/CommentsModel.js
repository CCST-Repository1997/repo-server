const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentsSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    group_id: {
        type: String,
        required: true
    },
    progress_id:  {
        type: String,
        required: true
    },
    chapter: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    userStatus: {
        type: String,
        required: true
    }
}, { timestamps: true});
// timestamps - makes a "createdAt" and "updatedAt" everytime we create a workout.


module.exports = mongoose.model('ProgressComments', commentsSchema);