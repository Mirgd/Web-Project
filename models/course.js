const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Course', CourseSchema);
