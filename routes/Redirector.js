const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const AlbumSchema = require('../schema/Album')
const AlbumPropsSchema = require('../schema/Albums')
const Global = require('../classes/Global')
const SessionSchema = require('../schema/Sessions')
const UserSchema = require('../schema/Registration')
const FilesSchema = require('../schema/Files')






const router = express.Router()

const global = new Global()

const AlbumModel = new mongoose.model('Album_prop', AlbumSchema)
const AlbumsModel = new mongoose.model('Album', AlbumPropsSchema)
const SessionModel = new mongoose.model("Session", SessionSchema)
const UserModel = new mongoose.model('User', UserSchema)
const FileModel = new mongoose.model('File', FilesSchema)

router.get('/', async (req, res, next) => {
    console.log( Math.random())
    const type = req.headers.type
    const url = req.headers.url
    try{
        if( type === 'album' && url !== undefined && url !== '' ){
            const albumData = await AlbumModel.find({
                shortUrl: url
            }, { albumId: 1} )

            if( albumData && albumData.length === 1 ){
                res.json({
                    status: true,
                    redirectUrl: albumData[0].albumId,
                    type: type
                })
            }
            else{
                console.log("A")
                res.json({
                    status: false,
                    error: {
                        message: "Invalid URL"
                    }
                })
            }
        }
        else{
            console.log("B")
            res.json({
                status: false,
                error: {
                    message: "Invalid URL"
                }
            })
        }
    }
    catch( err ){
        console.log("C")
        res.json({
            status: false,
            error: {
                message: "Server Error"
            }
        })
    }
})

module.exports = router