const mongoose = require('mongoose');

const timeSchema = new mongoose.Schema({
    patientName: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        default: ''
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('times', timeSchema); 