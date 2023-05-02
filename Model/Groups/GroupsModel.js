const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupsSchema = new Schema({
    groups: {
        type: String,
        required: true
    },
    admin_id: {
        type: String,
        required: true
    },
    isArchived:{
        type: Boolean,
        required: true
    },
    totalAveragePercent: {
        type: String,
        required: true
    },
    yearAndSection_id:{
        type: String,
        required: true
    },
    academicYear:{
        type: String,
        required: true
    },
    section:{
        type: String,
        required: true
    }
}, { timestamps: true});
// timestamps - makes a "createdAt" and "updatedAt" everytime we create a workout.


module.exports = mongoose.model('Groups', groupsSchema);