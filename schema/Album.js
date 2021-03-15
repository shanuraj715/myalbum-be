const mongoose = require('mongoose')

const validator = require('validator')

 
const Schema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    albumId:{
        type: String,
        required: true
    },
    name:{
        type: String
    },
    title:{
        type: String
    },
    description:{
        type: String
    },
    privacy: {
        type: String,
        default: "onlyme"
    },
    theme:{
        type: String,
        default: "classic"
    },
    sharedWith: [],
    starred:{
        type: Boolean,
        default: false
    },
    color:{
        type: String,
        default: 'transparent'
    },
    files: []
})

module.exports = Schema