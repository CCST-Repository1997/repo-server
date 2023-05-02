const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportsSchema = new Schema({
    input: {
        type: String
    },
    optionArr: [{
        name:{
            type: String
        },
    }],
    reportedMembersArr: [{
        name:{
            type: String,
            required: true
        }
    }],
    group_id: {
        type: String,
        required: true
    }

}, { timestamps: true});
// timestamps - makes a "createdAt" and "updatedAt" everytime we create a workout.


module.exports = mongoose.model('Reports', reportsSchema);