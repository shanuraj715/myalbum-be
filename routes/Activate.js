const express = require('express')

const mongoose = require('mongoose')
require('dotenv').config()

const router = express.Router()
const Global = require('../classes/Global')

const Activation = require('../schema/ActivationLinks')
const Register = require('../schema/Registration')
const AlbumSchema = require('../schema/Album')
const AlbumsSchema = require('../schema/Albums')


const ActivationModel = new mongoose.model("Activationlink", Activation)
const RegisterModel = new mongoose.model('User', Register)

const AlbumModel = new mongoose.model('Album_prop', AlbumSchema)
const AlbumsModel = new mongoose.model("Album", AlbumsSchema)
const global = new Global()


router.get('/account/:activation_key', async (req, res, next) => {
    const key = req.params.activation_key

    try{
        const activationDocument = await ActivationModel.find({
            activationKey: key,
            enabled: true
        }).sort({"_id": -1}).limit(1)
        if( activationDocument.length === 1){
            const cr_timestamp = activationDocument[0].createdAt.getTime()
            const curr_timestamp = Date.now()
            if( curr_timestamp - cr_timestamp <= (30 * 60 * 1000)){ // minute * seconds * 1000 { converting in milliseconds }
                /**
                 * getting user id
                 */
                const userId = activationDocument[0].userId
            
                /**
                 * token verified with time comparison
                 * update users collection in the database.
                 * set user account accountVerified to true
                 * so user can login to their account
                 */
                const UpdateUser = await RegisterModel.updateOne({
                    userId: userId,
                    accountVerified: false
                },{
                    $set: {
                        accountVerified: true
                    }
                })

                if( UpdateUser.nModified === 1){
                    /**
                     * account activation status updated
                     */
                    /**
                     * change activation link enable statis in database
                     */
                    const disableActivationLink = await ActivationModel.updateMany({
                        userId: userId
                    }, {
                        $set: {
                            enabled: false
                        }
                    })
                    setTimeout( () => {
                        res.json({
                            status: true,
                            message: "Account Verified"
                        })
                    }, 2000)

                }
                else{
                    /**
                     * account activation status failed
                     */
                    res.json({
                        status: false,
                        error: {
                            message: "Server Busy"
                        }
                    })
                }

            }
            else{
                /**
                 * token not verified using time comparison
                 */
                res.json({
                    status: false,
                    error: {
                        code: 400,
                        message: "Token Expired. Try to login and generate a new token"
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    code: 404,
                    message: "Invalid account activation token."
                }
            })
        }



    }catch( err ){
        res.json({
            status: false,
            error: {
                // message: "Server error. Unable to process the request."
                message: err
            }
        })
    }
})

module.exports = router