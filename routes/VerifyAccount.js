const express = require('express')
const UserSchema = require('../schema/Registration')
const ActivationLinksSchema = require('../schema/ActivationLinks')
const Global = require('../classes/Global')
const fetch = require('node-fetch')

const mongoose = require('mongoose')

const router = express.Router()
const global = new Global()
/* Models */

const UserModel = new mongoose.model('User', UserSchema)
const ActivationLinksModel = new mongoose.model('Activationlink', ActivationLinksSchema)



const sendActivationLink = async (sendto, link) => {
	await fetch('https://projects.techfacts007.in/send-email-api/register.php', {
		method: 'post',
		headers: {
			"Content-Type": "application/json" 
		},
		body: JSON.stringify({sendto,link})
	})
	.then( res => {
		console.log( res )
		return res.json()
	})
	.then( json => {
		console.log( json.status )
		if( json.status === true ){
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

const insertActivationLink = async (userId, link) => {
	const data = {
		userId: userId,
		activationKey: link
	}
	const result = await ActivationLinksModel.insertMany([data])
	if( result.length === 1 ){
		return true
	}
	else{
		return false
	}
}



router.post('/', async (req, res, next) => {
    const email = req.body.email
    /**
     * find user details from the users collecion
     */
    const userData = await UserModel.find({
        email: email
    })

    if( userData.length > 0 ){
        const user = userData[0]
        if( !user.accountVerified ){
            if( user.status ){
                const activationLink = global.generateActivationString()
                const sendEmail = await sendActivationLink(email, "http://localhost:3000/activate/" + activationLink)
                const insertLink = await insertActivationLink( user.userId, activationLink)
                if( insertLink ){
                    res.json({
                        status: true,
                        message: "Activation link sent."
                    })
                }
                else{
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
                        message: "Account disabled"
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    message: "Verified account"
                }
            })
        }
    }
    else{
        res.json({
            status: false,
            error: {
                message: "No user found"
            }
        })
    }
})

module.exports = router