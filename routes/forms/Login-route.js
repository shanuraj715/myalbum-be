const express = require('express')
const mongoose = require('mongoose')
const settings = require('../../settings.json')
const LoginRegister = require('../../classes/login-register')
const RegisterSchema = require('../../schema/Registration')
const SessionSchema = require('../../schema/Sessions')
require('dotenv').config()
const Global = require('../../classes/Global')
 
const global = new Global()

const router = express.Router()

const RegisterModel = new mongoose.model("User", RegisterSchema)


router.get('/logout/:sessionId', async (req, res, next) => {
   console.log("PP")
   const sessionId = req.params.sessionId
   const SessionModel = new mongoose.model("session", SessionSchema)

   const result = await SessionModel.updateOne({
      sessionId: sessionId,
      status: true
   }, {
      $set: {
         status: false
      }
   })
   console.log( result )

   if( result.nModified > 0 ){
      res.json({
         status: true,
         message: "Logged out"
      })
   }
   else{
      res.json({
         status: false,
         error: {
            message: "No active session found."
         }
      })
   }
   
})


router.post('/', async (req, res, next ) => {
	const { username, password } = req.body
   try{
      const result = await RegisterModel.find({
         $or: [ { username: username}, { email: username } ]
      })

      if( result.length === 1 ){
         const userPassword = result[0].password
         
         const status = await new LoginRegister().checkPassword( password, userPassword )
         
         if( status ){
            if( result[0].accountVerified ){
               if( result[0].status ){
                  const SessionModel = new mongoose.model("session", SessionSchema)

                  const sessionKey = await new LoginRegister().sessionKey()
                  const { userId, username, email } = result[0]
                  if( userId && username && email && sessionKey ){
                     const dataToInsert = {
                        userId: userId,
                        email: email,
                        username: username,
                        sessionId: sessionKey
                     }
                     const insertSessionStatus = await SessionModel.insertMany( [dataToInsert] )
                     if( insertSessionStatus.length === 1 ){
                        res.json({
                           status: true,
                           message: "Success",
                           session: {
                              sessionKey: sessionKey,
                              validFor: 28 * 24 * 60 * 60 * 1000
                           }
                        })
                     }
                     else{
                        res.json({
                           status: false,
                           error: {
                              code: 500,
                              message: "Unable to create your session"
                           }
                        })
                     }
                  }
                  else{
                     res.json({
                        status: false,
                        error: {
                           code: 500,
                           message: "Server error. Unable to fetch user detail."
                        }
                     })
                  }
               }
               else{
                  res.json({
                     status: false,
                     error: {
                        code: 403,
                        message: "Account disabled"
                     }
                  })
               }
            }
            else{
               res.json({
                  status: false,
                  error: {
                     code: 401,
                     message: "Account not verified"
                  }
               })
            }
         }
         else{
            res.json({
               status: false,
               error: {
                  code: 404,
                  message: "Incorrect Password"
               }
            })
         }
      }
      else{
         res.json({
            status: false,
            error: {
               code: 404,
               message: "No account found."
            }
         })
      }
   }
   catch( err ){
      res.json({
         status: false,
         error: {
            code: 500,
            message: "Server error."
         }
      })
   }
})


module.exports = router
