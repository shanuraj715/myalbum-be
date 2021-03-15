const mongoose = require('mongoose')
const validator = require('validator')

const Schema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        lowercase: true,
        trim: true,
        minlength: [2, "Invalid first name value."],
        maxlength: [16, "Invalid first name value"]
    },
    lastName: {
        type: String,
        lowercase: true,
        trim: true,
        minlength: [2, "Invalid last name value"],
        maxlength: [16, "Invalid last name value"]
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username already exist"],
        lowercase: true,
        trim: true,
        minlength: [6, "Invalid username"],
        maxlength: [32, "Invalid username"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        validate( value ){
            if( !validator.isEmail( value )){
                throw new Error("Email is Invalid")
            }
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    gender: {
        type: String,
        lowercase: true,
        enum: ['male', 'female', 'other']
    },
    accountVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    },
    fileEncSalt: {
        type: String,
        required: true
    },
    regDate: {
        type: Date,
        default: Date.now
    }
})


module.exports = Schema