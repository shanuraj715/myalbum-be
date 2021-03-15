const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const ContactSchema = require('../../schema/ContactUs')
const Global = require('../../classes/Global')
const GetIp = require('ipware')().get_ip

const router = express.Router()
const global = new Global()

const ContactModel = new mongoose.model('ContactUs_Form', ContactSchema)

router.post('/', async (req, res, next) => {
    console.clear()
    const { name, email, message } = req.body
    const userIp = GetIp( req ).clientIp

    const dataToInsert = {
        name: name,
        email: email,
        message: message,
        userIp: userIp
    }
    const result = await ContactModel.insertMany([dataToInsert])
    if( result.length !== 0 ){
        res.json({
            status: true,
            message: "Success"
        })
    }
    else{
        res.json({
            status: false,
            error: {
                message: "Server is busy."
            }
        })
    }

})

module.exports = router