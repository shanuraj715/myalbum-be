const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
// const settings = require('../../settings.json')
const LoginRegister = require('../../classes/login-register')
const Register = require('../../schema/Registration')
const Activation = require('../../schema/ActivationLinks')
const Global = require('../../classes/Global')
const fetch = require('node-fetch')

const router = express.Router()
const getIp = require('ipware')().get_ip

const global = new Global()
const Registration = new mongoose.model('User', Register)
const ActivationLink = new mongoose.model("ActivationLink", Activation)

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
	const result = await ActivationLink.insertMany([data])
	if( result.length === 1 ){
		return true
	}
	else{
		return false
	}
}


/**
 * getting post request for registration
 */
router.post('/', async (req, res, next) => {
	console.clear()
	const {fname, lname, username, email, pass} = req.body; // storing values from the request
	

  	const users = await Registration.find().sort({"_id": -1}).limit(1)
	const userId = users.length === 0 ? 100000 : users[0].userId + 1
	const data = {
		userId: userId,
		firstName: fname,
		lastName: lname,
		username: username,
		password: await new LoginRegister().encryptPassword( pass ),
		email: email,
		fileEncSalt: new Global().fileEncryptionSalt()
	}

	
	try{
		const findUsername = await Registration.find({username: username})

		if( findUsername.length === 0 ){
			const findEmail = await Registration.find({ email: email })

			if( findEmail.length === 0 ){
				const User = new Registration(data)
				const activationLink = global.generateActivationString()
				const sendEmail = await sendActivationLink(email, "http://localhost:3000/activate/" + activationLink)
				const insertLink = await insertActivationLink( userId, activationLink)
				if( insertLink ){
					const result = await Registration.insertMany( [User] )

					if( result.length === 1 ){
						res.json({
							status: true,
							message: "registration success"
						})
					}
					else{
						res.json({
							status: false,
							error:{
								message: "registration failed"
							}
						})
					}
				}
				else{
					res.json({
						status: false,
						error:{
							message: "Server error"
						}
					})
				}
			}
			else{
				res.json({
					status: false,
					error:{
						message: "Email already registered."
					}
				})
			}
		}
		else{
			res.json({
				status: false,
				error:{
					message: "Username not available."
				}
			})
		}
	}catch( err ){
		console.log(err)
		res.json({
			status: false,
			errors: {
        message: "Unknown error occured."
      }
		})
	}
// mongoose.connection.close()
	
})

module.exports = router