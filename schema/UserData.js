const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true
    },
    profilePic: {
        type: String,
        default: ''
    },
    coverPic: {
        type: String,
        default: ''
    },
    gender: {
        type: String
    },
    bio: {
        type: String
    },
    dob: {
        type: Date
    },
    social: []
},{
    timestamps: true
})

module.exports = Schema