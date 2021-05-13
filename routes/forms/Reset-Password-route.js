const express = require ('express')
const mongoose = require ('mongoose')
const settings = require('../../settings.json')
const LoginRegisterFuncClass = require('../../classes/login-register')
const UserSchema = require('../../schema/Registration')
const SessionSchema = require('../../schema/Sessions')
const OtpSchema = require('../../schema/UserOtps')
require('dotenv').config()
const Global = require('../../classes/Global')
const getIP = require('ipware')().get_ip
const fetch = require('node-fetch')

const global = new Global()
const router = express.Router()



// Models
const UserModel = new mongoose.model('User', UserSchema)
const SessionModel = new mongoose.model("Session", SessionSchema)
const OtpModel = new mongoose.model('UserOtp', OtpSchema)

const loginRegister = new LoginRegisterFuncClass()


const sendOtp = async ( otp, fname, email_address ) => {
    await fetch('https://projects.techfacts007.in/send-email-api/reset-password.php', {
        method: 'post',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({ email_address, otp, fname})
    })
    .then( res => {
        return res.json()
    })
    .then( json => {
        if( json.status ){
            return true
        }
        else{
            return false
        }
    })
    .catch( err => {
        console.log( err )
    })
}




router.post('/send-otp', async (req, res, next) => {
    const username_email = req.headers.text
    if( username_email !== undefined || username_email !== '' ){
        try{
            /**
             * find user data from users collection
             */
            const userData = await UserModel.find({
                $or: [{
                    username: username_email
                }, {
                    email: username_email
                }]
            },{
                userId: 1,
                username: 1,
                email: 1,
                status: 1,
                accountVerified: 1,
                firstName: 1
            })
            if( userData && userData.length === 1 ){
                if( userData[0].accountVerified ){
                    if( userData[0].status ){
                        const otp = Math.floor(100000 + Math.random() * 900000)
                        // store in otp collection
                        const IpAddressObj = getIP( req )
                        console.log( IpAddressObj )
                        const dataToInsert = {
                            userId: userData[0].userId,
                            otp: otp,
                            ipAddress: IpAddressObj.clientIp,
                            type: 'reset-password'
                        }
                        const storingOtp = await OtpModel.insertMany([dataToInsert])
                        console.log( storingOtp )
                        if( storingOtp.length === 1 ){
                            const firstName = userData[0].firstName.charAt(0).toUpperCase() + userData[0].firstName.slice(1)
                            const sendingOtp = await sendOtp( otp, firstName, userData[0].email )
                            res.json({
                                status: true,
                                message: "Email sent successfully",
                                otpId: storingOtp[0]._id
                            })
                        }
                        else{
                            // otp not stored in database
                            res.json({
                                status: false,
                                error: {
                                    message: "Server busy"
                                }
                            })
                        }
                    }
                    else{
                        // blocked account
                        res.json({
                            status: false,
                            error: {
                                message: "Account was blocked by the system."
                            }
                        })
                    }
                }
                else{
                    // account not verified
                    res.json({
                        status: false,
                        error: {
                            code: 600,
                            message: "Verify your account first"
                        }
                    })
                }
            }
            else{
                res.json({
                    status: false,
                    error: {
                        message: "Invalid username or email Id"
                    }
                })
            }
        }
        catch( err ){
            console.log( err )
            res.json({
                status: false,
                error: {
                    message: "Server Error"
                }
            })
        }
    }
})




router.post('/confirm-otp', async (req, res, next) => {
    const otp = req.headers.otp
    const otpId = req.headers.otp_id
    if( otp !== undefined && otp !== '' && otpId !== undefined && otpId !== '' ){
        try{
            const OtpData = await OtpModel.findById( otpId )
            if( OtpData._id !== undefined ){
                if( OtpData.otp === otp ){
                    if( OtpData.status ){
                        // check expiry time
                        const creationTime = OtpData.createdAt.getTime()
                        const current_time = Date.now()
                        if( current_time - creationTime <= (15 * 60 * 1000) ){
                            // set otp to expired
                            const updateDocument = await OtpModel.updateMany({
                                userId: OtpData.userId,
                                type: 'reset-password'
                            }, {
                                $set: {
                                    status: false
                                }
                            })
                            res.json({
                                status: true,
                                message: "Password Changed"
                            })
                        }
                    }
                    else{
                        // status was false on this document
                        res.json({
                            status: false,
                            error: {
                                message: "Invalid or Expired OTP"
                            }
                        })
                    }
                    
                }
                else{
                    // wrong otp
                    res.json({
                        status: false,
                        error: {
                            message: "Wrong OTP"
                        }
                    })
                }
            }
            else{
                // invalid or wrong otp ID
                res.json({
                    status: false,
                    error: {
                        message: "Invalid request"
                    }
                })
            }
        }
        catch( err ){
            console.log( err )
            res.json({
                status: false,
                error: {
                    message: "Server Error"
                }
            })
        }
    }
    else{
        res.json({
            status: false,
            error: {
                message: "Error due to invalid data."
            }
        })
    }
})



router.post('/change-password', async (req, res, next) => {
    const password = req.headers.pass
    const otp_id = req.headers.otp_id
    if( password !== undefined && password !== '' ){
        try{
            // find document from userOtps collection
            const document = await OtpModel.findById( otp_id )
            if( document && document._id !== undefined ){
                if( !document.status ){
                    const creationTime = document.createdAt.getTime()
                    const current_time = Date.now()
                    if( current_time - creationTime <= (16 * 60 * 1000) ){
                        // encrypt password
                        const encPass = await loginRegister.encryptPassword( password )
                        const updatingPassword = await UserModel.updateOne({
                            userId: document.userId
                        },{
                            $set: {
                                password: encPass
                            }
                        })
                        if( updatingPassword && updatingPassword.nModified === 1 ){
                            res.json({
                                status: true,
                                message: "Password Changed"
                            })
                        }
                    }
                    else{
                        // time expired
                        res.json({
                            status: false,
                            error: {
                                message: "Retry... Timeout"
                            }
                        })
                    }
                }
                else{
                    // document status got true here
                    // it has to be false because when otp was verified this was set to false.
                    // if it is true here that means there is some data error.
                    // to maintain user data privacy and data security
                    // prevent this request to change the password
                    res.json({
                        status: false,
                        error: {
                            message: "Error. Please reload the page"
                        }
                    })
                }
            }
            else{
                // no document found
                res.json({
                    status: false,
                    error: {
                        message: "Error due to invalid data"
                    }
                })
            }
        }
        catch( err ){
            console.log( err )
            res.json({
                status: false,
                error: {
                    message: "Server error"
                }
            })
        }
    }
    else{
        res.json({
            sttaus: false,
            error: {
                message: "Error due to invalid data"
            }
        })
    }
})

module.exports = router