const mongoose = require('mongoose')
const express = require('express')
const SessionSchema = require('../schema/Sessions')

const router = express.Router()

const SessionModel = new mongoose.model("Session", SessionSchema)

router.post('/', async (req, res, next) => {
    const sessionId = req.body.sessionKey
    try{
        if( sessionId !== '' || sessionId !== undefined ){
            let userData = await SessionModel.find({
                sessionId: sessionId,
                status: true
            })
            if( userData.length !== 0 ){
                userData = userData[0]
                
                const sessionExpireTimestamp = new Date(userData.expire).getTime()
                const currentTimeStamp = Date.now()

                if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                    const userId = userData.userId
                    const username = userData.username
                    const email = userData.email
                    res.json({
                        status: true,
                        userdata: {
                            userId: userId,
                            email: email,
                            username: username,
                        }
                    })
                }
                else{
                    res.json({
                        status: false,
                        error: {
                            message: "Session Expired."
                        }
                    })
                }
            }
            else{
                res.json({
                    status: false,
                    error: {
                        message: "No active session found."
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    message: "Invalid Request."
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                message: "Server Error."
            }
        })
    }
})




module.exports = router