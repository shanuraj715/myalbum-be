const mongoose = require('mongoose')
const settings = require('../settings.json')

const SessionsSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    sessionId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    expire: {
        type: Date,
        default: () => new Date(+new Date() + settings.loggedFor *24*60*60*1000)
    }
}, {
    timestamps: true
})

module.exports = SessionsSchema