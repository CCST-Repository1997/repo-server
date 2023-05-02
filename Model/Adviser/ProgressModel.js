const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    progress: {
        type: String,
        required: true,
    },
    admin_id: {
      type: String,
      required: true,
    },
    group_id: {
      type: String,
      required: true,
    },
    percent: {
      type: String,
      required: true,
    }
});

module.exports =  mongoose.model('Progress', ProgressSchema);