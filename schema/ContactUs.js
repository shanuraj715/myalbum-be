const mongoose = require('mongoose')
const validator = require('validator')

const Schema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate( value ){
            if( !validator.isEmail( value )){
                throw new Error("Email is invalid")
            }
        }
    },
    message: {
        type: String,
        required: true,
        unique: true
    },
    userIp: {
        type: String,
        required: true
    }
},{
    timestamps: true
})

module.exports = Schema