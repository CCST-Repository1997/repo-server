const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports =  mongoose.model('Section', SectionSchema);