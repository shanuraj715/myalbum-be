const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileEncName: {
        type: String,
        required: true,
        lowercase: true,
    },
    size: {
        type: Number,
        required: true
    }
},{
    timestamps: true
})

module.exports = Schema