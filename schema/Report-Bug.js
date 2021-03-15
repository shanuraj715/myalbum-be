const mongoose = require('mongoose')

const validator = require('validator')

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    file: [{
        filePath: String
    }],
    userIp: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = Schema