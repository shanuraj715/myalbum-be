const mongoose = require ('mongoose')

const OtpSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    otp: {
        type: String
    },
    link: {
        type: String
    },
    ipAddress: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    },
    type: {
        type: String
    }
}, {
    timestamps: true
})

module.exports = OtpSchema