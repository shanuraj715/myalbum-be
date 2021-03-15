const express = require('express')
const mongoose = require('mongoose')
const UserSchema = require('../schema/Registration')
const SessionSchema = require('../schema/Sessions')
const router = express.Router()




const UserModel = new mongoose.model("User", UserSchema)
const SessionModel = new mongoose.model("Session", SessionSchema)

router.get('/sessionId/:sessionId', async (req, res, next) => {
    const sessionId = req.params.sessionId
    let sessionData = await SessionModel.find({
        sessionId: sessionId,
        status: true
    })
    if( sessionData.length !== 0 ){
        sessionData = sessionData[0]
    
        const sessionExpireTimestamp = new Date(sessionData.expire).getTime()
        const currentTimeStamp = Date.now()
        if( sessionExpireTimestamp - currentTimeStamp > 0 ){
            const userId = sessionData.userId
            let userData = await UserModel.find({
                userId: userId,
                accountVerified: true,
                status: true
            })

            if( userData.length !== 0 ){
                userData = userData[0]
                console.log( userData )
                res.json({
                    status: true,
                    user: {
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        username: userData.username,
                        email: userData.email,
                        gender: userData.gender || null,
                        age: userData.age || null
                    }
                })
            }
            else{
                res.json({
                    status: false,
                    error: {
                        message: "No user found."
                    }
                })
            }
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
})

module.exports = router