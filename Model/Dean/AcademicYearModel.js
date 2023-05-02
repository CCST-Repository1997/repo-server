const mongoose = require('mongoose');

const AcademicYearSchema = new mongoose.Schema({
    academicYear: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports =  mongoose.model('AcademicYear', AcademicYearSchema);