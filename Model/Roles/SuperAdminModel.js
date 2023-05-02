const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SuperAdminAccountSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    password: {
        type: String,
        required: true
    },
    authorization: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
}, { timestamps: true});
// timestamps - makes a "createdAt" and "updatedAt" everytime we create a workout.


module.exports = mongoose.model('SuperAdminAccount', SuperAdminAccountSchema);