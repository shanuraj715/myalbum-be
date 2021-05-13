const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const Albums = require('./routes/Albums-route')
const Album = require('./routes/Album-route')
const mongoose = require('mongoose')


const Login = require("./routes/forms/Login-route")
const Register = require('./routes/forms/Register-route')

const EditAlbum = require('./routes/EditAlbum-route')
const Activate = require('./routes/Activate')
const VerifyAccount = require('./routes/VerifyAccount')
const SessionData = require('./routes/Session')
const ContactUs = require('./routes/forms/Contact-route')
const ReportBug = require('./routes/forms/Report-bug-route')
const User = require('./routes/User')
const AlbumOptions = require('./routes/Album-options-route')
const ResetPassword = require('./routes/forms/Reset-Password-route')
const Sharing = require('./routes/AlbumSharing')

const UserData = require('./routes/UserData')
const Redirector = require('./routes/Redirector')

const server = express()



server.use(express.json())
server.use(express.urlencoded({ extended: true }))

/**
 * solving cors Origin problem
 */
server.use(cors())

/**
 * handling cors
 */
var allowedDomains = [] // ['https://google.com', 'https://facebook.com']
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if( allowedDomains.length === 0 ){
        corsOptions = { origin: true }
    }
    else{
        if (allowedDomains.indexOf(req.header('Origin')) !== -1) {
            corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
          } else {
            corsOptions = { origin: false } // disable CORS for this request
        }
    }
    
    callback(null, corsOptions) // callback expects two parameters: error and options
}

/**
 * making Uploads folder available for public.
 */
server.use('/Uploads', cors( corsOptionsDelegate ), express.static('Uploads'))

/**
 * enabling file upload process
 */
server.use( fileUpload())

/**
 * connecting to database
 */
mongoose.connect( process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then( () => {
    console.log("Connected to database.")
})
.catch( err => {
    console.log( err )
})

/**
 * Routes for the server
 */

server.use('/api/albums', Albums)
server.use('/api/album', Album)
server.use('/api/album-opt', AlbumOptions)

server.use('/api/login', Login)
server.use('/api/reset-password', ResetPassword)
server.use('/api/register', Register)
server.use('/api/activate', Activate)
server.use('/api/verify', VerifyAccount) // send activation links ... etc...

server.use('/api/edit-album', EditAlbum)

server.use('/api/sharing/', Sharing)


server.use('/api/get-session-data', SessionData )
server.use('/api/user', User )
server.use('/api/user-data', UserData )
server.use('/api/redirect', Redirector)



server.use('/api/contact_us', ContactUs)
server.use('/api/report-bug', ReportBug)

server.use((error, req, res, next) => {
    if( res.headerSent ){
        return next( error )
    }
    res.status(error.code || 500)
    res.json({message: error.message || "An unknown error occured"})
})
server.listen(5000)
