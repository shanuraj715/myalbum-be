const mongoose = require('mongoose')

const validator = require('validator')

const AlbumsSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    albumId: {
        type: String,
        required: true,
    },
    // encryptedName:{
    //     type: String,
    //     required: true
    // },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        lowercase: true,
        default: "albums"
    },
    blocked: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

module.exports = AlbumsSchema