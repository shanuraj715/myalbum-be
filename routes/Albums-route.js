const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const Albums = require('../schema/Albums')

const AlbumProps = require('../schema/Album')
const UserSchema = require('../schema/Registration')

const Global = require('../classes/Global')

const router = express.Router()

const global = new Global()
 


const AlbumModel = new mongoose.model('Album', Albums)
const AlbumPropsModel = new mongoose.model('Album_prop', AlbumProps)
const UsersModel = new mongoose.model("User", UserSchema)

/*
using filter to filter the output.
value for filter can be albums, shared, starred, trashed 

*/
router.get('/:filter/:sessionId', async ( req, res, next ) => {
    let filter = req.params.filter
    try{
        const userId = await global.validateUserLogin( req )
        if( filter === 'albums' ){
            filter = [{
                status: 'albums'
            }]
        }
        else{
            filter = [{
                status: filter
            }]
        }
        if( userId !== "0" ){/**
            * fetch data from database
            */
            const albums = await AlbumModel.find({
                userId: userId,
                // status: filter,
                $or: filter,
                blocked: false
            })
            const album_props = await AlbumPropsModel.find({
                userId: userId
            })
            let album_list = []

            for( let i=0; i < albums.length; i++){
                let album_id_from_albums_collection = albums[i].albumId
                
                for( let j=0; j < album_props.length ; j++ ){
                    if( album_props[j].albumId === album_id_from_albums_collection ){
                        let oneDocument = {
                            title: albums[i].name,
                            albumid: albums[i].albumId,
                            privacy: album_props[j].privacy,
                            creation_timestamp: albums[i].createdAt,
                            css_color_class: album_props[j].color,
                            starred: album_props[j].starred
                        }
                        album_list.push( oneDocument )
                        break
                    }
                }
            }

            res.json({
                status: true,
                "list": album_list
            })
        }
        else{
            res.json({
                status: false,
                error: {
                    message: "Please login to use the service"
                }
            })
            throw new Error("Please login to use the service")
        }
    }catch( err ){
        res.json({
            status: false,
            error: {
                message: "Server error."
            }
        })
    }
    
})








/**
 * get shared album list
 */
router.get('/sharedWithMe', async(req,res,next) => {
    console.log("SHANU")
    try{
        let userId = await global.validateUserLogin( req )
        if( userId !== 0 && userId !== "0" ){
            const sharedAlbumsUser = await UsersModel.find({
                userId: userId,
                status: true
            })
            console.log(sharedAlbumsUser)

            if( sharedAlbumsUser && sharedAlbumsUser.length === 1 ){
                const sharedAlbums = sharedAlbumsUser[0].sharedAlbums
                let albumsArrayOfObj = []
                const promise = sharedAlbums.map( async albumId => {
                    const albumData = await AlbumModel.find({
                        albumId: albumId
                    })

                    if( albumData && albumData.length === 1 ){
                        if( !albumData[0].blocked && albumData[0].status === 'albums' ){
                            const albumPropData = await AlbumPropsModel.find({
                                albumId: albumId
                            })
                            if( albumPropData && albumPropData.length === 1 ){
                                /**
                                 * get username 
                                 */
                                const userDocumentPerAlbum = await UsersModel.find({
                                    userId: albumPropData[0].userId
                                })
                                if( userDocumentPerAlbum && userDocumentPerAlbum.length === 1 ){
                                    let oneDocument = {
                                        title: albumPropData[0].name,
                                        albumid: albumPropData[0].albumId,
                                        privacy: albumPropData[0].privacy,
                                        creation_timestamp: albumData[0].createdAt,
                                        css_color_class: albumPropData[0].color,
                                        starred: albumPropData[0].starred,
                                        owner: userDocumentPerAlbum[0].username
                                    }
                                    albumsArrayOfObj.push( oneDocument )
                                }
                            }
                        }
                    }
                    return true
                })

                const waitingStatus = await Promise.all( promise )
                if( waitingStatus ){
                    res.json({
                        status: true,
                        list: albumsArrayOfObj
                    })
                }
            }
            else{
                res.json({
                    status: true,
                    error: {
                        message: "02"
                    }
                })
            }
        }
        else{
            res.json({
                status: true,
                error: {
                    message: "01"
                }
            })
        }
        
    }
    catch( err ){
        res.json({
            status: true,
            error: {
                message: err
            }
        })
    }
})


/**
 * Handling post request
 * Create or add Albums in the database
 */

router.post('/:sessionId', async ( req, res, next ) => {
    
    
    try{
        let userId = await global.validateUserLogin( req )
        if( userId === "0" ){
            res.json({
                status: false,
                error: {
                    message: "Please login to use the service"
                }
            })
            throw new Error("Please login to use the service")
        }

        /**
         * getting all albums with same album id
         */
        const albumId = global.generateAlbumId()
        const findAlbumId = await AlbumModel.find({
            albumId: albumId
        })

        if( findAlbumId.length !== 0 ){
            res.json({
                status: false,
                error: {
                    message: "Failed. Please retry"
                }
            })
            //throw new Error("Failed. Please retry")
        }

        /**
         * now retriving all data and setting all data
         */

        const albumName = req.body.albumName // album name from api post request
        const albumdata = {
            userId: userId,
            albumId: albumId,
            name: albumName
        }
        const albumPropsData = {
            userId: userId,
            albumId: albumId,
            name: albumName,
            title: '',
            description: '',
            sharedWith: [],
            files: []
        }

        const Albums = new AlbumModel( albumdata )
        const result = await AlbumModel.insertMany( [Albums] )
        const Album = new AlbumPropsModel( albumPropsData)
        const result2 = await AlbumPropsModel.insertMany([Album])

        if( result.length !== 0 ){
            res.json({
                status: true,
                message: "Album Created",
                albumId: albumdata.albumId
            })
        }
        else{
            res.json({
                status: false,
                error: {
                    message: "Server is unable to process the request"
                }
            })
        }
    }
    catch( err){
        res.json({
            status: false,
            error:{
                message: "Unknown error occured."
            }
        })
    }
})

/**
 * delete Album
 */

router.post('/delete', async (req, res, next) => {
    const albumId = req.body.albumId
    const sessionId = req.headers.sessionId
})

/**
 * Rename Album
 */

 router.post('/rename', async (req, res, next) => {

 })

 /**
  * Starring Process
  */

router.post('/star', async ( req, res, next) => {

  })

  /**
   * change color of album
   */
router.post('/change-color', async (req, res, next) => {

})

module.exports = router