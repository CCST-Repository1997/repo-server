const mongoose = require('mongoose');

const YearAndSectionSchema = new mongoose.Schema({
    adviser: {
        type: String,
        required: true,
    },
    admin_id: {
      type: String,
      required: true,
    },
    section: {
        type: String,
        required: true,
    },
    academicYear: {
      type: String,
      required: true,
  },
});

module.exports =  mongoose.model('YearAndSection', YearAndSectionSchema);