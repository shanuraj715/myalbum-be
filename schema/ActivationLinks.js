const mongoose = require('mongoose')

const validator = require('validator')

const sharedWithSchema = mongoose.Schema({

})

const ActivationLinksSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    activationKey: {
        type: String,
        required: true
    },
    enabled:{
        type: Boolean,
        default: true
    }
},{
    timestamps: true
})

module.exports = ActivationLinksSchema