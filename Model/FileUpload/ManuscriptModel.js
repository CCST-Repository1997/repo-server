const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const manuscriptSchema = new Schema({
    // Manuscript file
    manuscript: {
        type: String,
        required: true
    },
    manuscriptPath: {
        type: String,
        required: true
    },
    manuscriptMimetype: {
        type: String,
        required: true
    },

    // Abstract file
    abstract: {
        type: String,
        required: true
    },
    abstractPath: {
        type: String,
        required: true
    },
    abstractMimetype: {
        type: String,
        required: true
    },

    // Info
    user_id: {
        type: String,
        required: true
    },
    admin_id: {
        type: String,
        required: true
    },
    adviserName: {
        type: String,
        required: true
    },
    group_id: {
        type: String,
        required: true
    },
    groupName: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    isArchived: {
        type: Boolean,
        required: true
    },

}, { timestamps: true});
// timestamps - makes a "createdAt" and "updatedAt" everytime we create a workout.


module.exports = mongoose.model('ManuscriptFiles', manuscriptSchema);