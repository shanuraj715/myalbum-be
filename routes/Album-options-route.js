const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config();

const AlbumsSchema = require('../schema/Albums')
const AlbumPropsSchema = require('../schema/Album')
const Global = require('../classes/Global')
const SessionSchema = require('../schema/Sessions')
const UserSchema = require('../schema/Registration')
const FilesSchema = require('../schema/Files')




const router = express.Router()

const global = new Global()

const AlbumPropsModel = new mongoose.model('Album_prop', AlbumPropsSchema)
const AlbumsModel = new mongoose.model('Album', AlbumsSchema)
const SessionModel = new mongoose.model('Session', SessionSchema)
const UserModel = new mongoose.model('User', UserSchema)
const FileModel = new mongoose.model('File', FilesSchema)

router.get('/get-url/:albumId', async (req, res, next) => {
    const sessionId = req.headers.sessionid || req.headers.sessionId
    const albumId = req.params.albumId
    console.log( "A", albumId )
    try{
        const sessionData = await SessionModel.find({
            sessionId: sessionId,
            status: true
        })
        console.log(sessionData)
        if( sessionData && sessionData.length === 1 ){
            console.log("B")
            const sessionExpireTimestamp = new Date(sessionData[0].expire).getTime()
            const currentTimeStamp = Date.now()
            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                console.log("C")
                const userId = sessionData[0].userId
                const albumData = await AlbumPropsModel.find({
                    albumId: albumId
                })
                if( albumData && albumData.length === 1 ){
                    console.log("D")
                    if( userId === albumData[0].userId ){
                        console.log("E")
                        if( albumData[0].privacy === 'onlyme' ){
                            console.log("F")
                            /**
                             * update the privacy to unlisted and return url to the user
                             */
                            const updatePrivacy = await AlbumPropsModel.updateOne({
                                albumId: albumId
                            }, {
                                "privacy": 'unlisted'
                            })
                            // console.log( updatePrivacy )
                            if( !albumData[0].shortUrl || albumData[0].shortUrl === '' ){
                                
                                console.log("G")
                                albumData[0].shortUrl = global.generateAlbumUrl()
                                const createUrl = await AlbumPropsModel.updateOne({
                                    albumId: albumId
                                },{
                                    $set: {
                                        "shortUrl": albumData[0].shortUrl
                                    }
                                })

                                if( createUrl.nModified === 1 ){
                                    res.json({
                                        status: true,
                                        message: "Success",
                                        url: albumData[0].shortUrl
                                    })
                                }
                            }
                            else{
                                res.json({
                                    status: true,
                                    message: "Success",
                                    url: albumData[0].shortUrl
                                })
                            }
                        }
                        else{
                            if( !albumData[0].shortUrl || albumData[0].shortUrl === '' ){
                                
                                console.log("G")
                                albumData[0].shortUrl = global.generateAlbumUrl()
                                const createUrl = await AlbumPropsModel.updateOne({
                                    albumId: albumId
                                },{
                                    $set: {
                                        "shortUrl": albumData[0].shortUrl
                                    }
                                })

                                if( createUrl.nModified === 1 ){
                                    res.json({
                                        status: true,
                                        message: "Success",
                                        url: albumData[0].shortUrl
                                    })
                                }
                            }
                            else{
                                res.json({
                                    status: true,
                                    message: "Success",
                                    url: albumData[0].shortUrl
                                })
                            }
                        }
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                code: 403,
                                message: "Access Forbidden"
                            }
                        })
                    }
                }
                else{
                    res.json({
                        status: false,
                        error: {
                            code: 404,
                            message: "Album not found"
                        }
                    })
                }
            }
            else{
                res.json({
                    status: false,
                    error: {
                        code: 500,
                        message: "Album not found"
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    code: 401,
                    message: "Please login first"
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                code: 500,
                message: "Server Error"
            }
        })
    }
})

















/* starred process */
router.get('/starred/:albumId', async (req, res, next) => {
    const sessionId = req.headers.sessionid || req.headers.sessionId
    const albumId = req.params.albumId
    console.log( "A", albumId )
    try{
        const sessionData = await SessionModel.find({
            sessionId: sessionId,
            status: true
        })
        console.log(sessionData)
        if( sessionData && sessionData.length === 1 ){
            console.log("B")
            const sessionExpireTimestamp = new Date(sessionData[0].expire).getTime()
            const currentTimeStamp = Date.now()
            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                console.log("C")
                const userId = sessionData[0].userId
                const albumData = await AlbumPropsModel.find({
                    albumId: albumId
                })
                if( albumData && albumData.length === 1 ){
                    console.log("D")
                    if( userId === albumData[0].userId ){
                        console.log("E")
                        const updatingStarred = await AlbumPropsModel.updateOne({
                            albumId: albumId,
                        },{
                            $set: {
                                starred: !albumData[0].starred
                            }
                        })

                        if( updatingStarred.nModified === 1 ){
                            if( albumData[0].starred ){
                                res.json({
                                    status: true,
                                    message: "Removed from starred",
                                    marked: false
                                })
                            }
                            else{
                                res.json({
                                    status: true,
                                    message: "Marked as starred",
                                    marked: true
                                })
                            }
                        }
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                code: 403,
                                message: "Access Forbidden"
                            }
                        })
                    }
                }
                else{
                    res.json({
                        status: false,
                        error: {
                            code: 404,
                            message: "Album not found"
                        }
                    })
                }
            }
            else{
                res.json({
                    status: false,
                    error: {
                        code: 500,
                        message: "Album not found"
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    code: 401,
                    message: "Please login first"
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                code: 500,
                message: "Server Error"
            }
        })
    }
})





























/* rename album */
router.post('/rename/:albumId', async (req, res, next) => {
    const sessionId = req.headers.sessionid || req.headers.sessionId
    const albumId = req.params.albumId
    const albumName = req.headers.albumname
    console.log( "A", albumId )
    if( albumName !== undefined ){
        try{
            const sessionData = await SessionModel.find({
                sessionId: sessionId,
                status: true
            })
            console.log(sessionData)
            if( sessionData && sessionData.length === 1 ){
                console.log("B")
                const sessionExpireTimestamp = new Date(sessionData[0].expire).getTime()
                const currentTimeStamp = Date.now()
                if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                    console.log("C")
                    const userId = sessionData[0].userId
                    const albumData = await AlbumPropsModel.find({
                        albumId: albumId
                    })
                    if( albumData && albumData.length === 1 ){
                        console.log("D")
                        if( userId === albumData[0].userId ){
                            console.log("E")
                            const updatingAlbumProps = await AlbumPropsModel.updateOne({
                                albumId: albumId,
                            },{
                                $set: {
                                    name: albumName
                                }
                            })

                            const updatingAlbums = await AlbumsModel.updateOne({
                                albumId: albumId
                            }, {
                                $set: {
                                    name: albumName
                                }
                            })

                            if( updatingAlbums.nModified === 1 ){
                                if( albumData[0].starred ){
                                    res.json({
                                        status: true,
                                        message: "Removed from starred",
                                        marked: false
                                    })
                                }
                                else{
                                    res.json({
                                        status: true,
                                        message: "Marked as starred",
                                        marked: true
                                    })
                                }
                            }
                        }
                        else{
                            res.json({
                                status: false,
                                error: {
                                    code: 403,
                                    message: "Access Forbidden"
                                }
                            })
                        }
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                code: 404,
                                message: "Album not found"
                            }
                        })
                    }
                }
                else{
                    res.json({
                        status: false,
                        error: {
                            code: 500,
                            message: "Album not found"
                        }
                    })
                }
            }
            else{
                res.json({
                    status: false,
                    error: {
                        code: 401,
                        message: "Please login first"
                    }
                })
            }
        }
        catch( err ){
            res.json({
                status: false,
                error: {
                    code: 500,
                    message: "Server Error"
                }
            })
        }
    }
    else{
        res.json({
            status: false,
            error: {
                code: 403,
                message: "Invalid album name"
            }
        })
    }
})

















/* trash or delete album */
router.post('/delete/:albumId', async (req, res, next) => {
    const sessionId = req.headers.sessionid || req.headers.sessionId
    const albumId = req.params.albumId
    console.log( "A", albumId )
    try{
        const sessionData = await SessionModel.find({
            sessionId: sessionId,
            status: true
        })
        console.log(sessionData)
        if( sessionData && sessionData.length === 1 ){
            console.log("B")
            const sessionExpireTimestamp = new Date(sessionData[0].expire).getTime()
            const currentTimeStamp = Date.now()
            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                console.log("C")
                const userId = sessionData[0].userId
                const albumData = await AlbumPropsModel.find({
                    albumId: albumId
                })
                if( albumData && albumData.length === 1 ){
                    console.log("D")
                    if( userId === albumData[0].userId ){
                        console.log("E")
                        const updateAlbums = await AlbumsModel.updateOne({
                            albumId: albumId
                        },{
                            $set: {
                                status: "trashed",
                                trashedDate: Date.now()
                            }
                        })

                        if( updateAlbums.nModified === 1 ){
                            res.json({
                                status: true,
                                message: "Album moved to trash"
                            })
                        }
                        else{
                            res.json({
                                status: false,
                                error: {
                                    message: "Server is unable to update the status."
                                }
                            })
                        }
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                code: 403,
                                message: "Access Forbidden"
                            }
                        })
                    }
                }
                else{
                    res.json({
                        status: false,
                        error: {
                            code: 404,
                            message: "Album not found"
                        }
                    })
                }
            }
            else{
                res.json({
                    status: false,
                    error: {
                        code: 500,
                        message: "Album not found"
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    code: 401,
                    message: "Please login first"
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                code: 500,
                message: "Server Error"
            }
        })
    }
})


















/* permanently delete album */
router.post('/delete-permanent/:type/:option', async (req, res, next) => {
    /**
     * option param can be "one" or "all". type of String
     */
    const sessionId = req.headers.sessionid || req.headers.sessionId
    const type =  req.params.type 
    const option = req.params.option
    console.log( "A" )
    try{
        const sessionData = await SessionModel.find({
            sessionId: sessionId,
            status: true
        })
        console.log(sessionData)
        if( sessionData && sessionData.length === 1 ){
            console.log("B")
            const sessionExpireTimestamp = new Date(sessionData[0].expire).getTime()
            const currentTimeStamp = Date.now()
            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                console.log("C")
                const userId = sessionData[0].userId


                if( option === 'one' ){
                    const albumId = req.headers.albumid
                    console.log("ALBUMID", albumId)
                    const albumData = await AlbumPropsModel.find({
                        albumId: albumId
                    })
                    if( albumData && albumData.length === 1 ){
                        console.log("D")
                        if( userId === albumData[0].userId ){
                            console.log("E")
                            /**
                             * delete files
                             */
                            const files = albumData[0].files

                            files.map( async (item, index) => {
                                let file_path = process.env.USER_FILES + new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + userId + '/' + item
                                await global.deleteFile( file_path )
                                return true
                            } )

                            /**
                             * delete record from the database
                             */
                            
                            const deletingAlbum = await AlbumsModel.deleteOne({
                                albumId: albumId,
                                status: type
                            })

                            if( deletingAlbum && deletingAlbum.deletedCount === 1 ){
                                const deleteingAlbumProps = await AlbumPropsModel.deleteOne({
                                    albumId: albumId
                                })

                                if( deleteingAlbumProps && deleteingAlbumProps.deletedCount === 1 ){
                                    res.json({
                                        status: true,
                                        message: "Album deleted"
                                    })
                                }
                                else{
                                    res.json({
                                        status: true,
                                        error: {
                                            message: "Album deleted but server is unable to delete the files of the album."
                                        }
                                    })
                                }
                            }
                            else{
                                res.json({
                                    status: false,
                                    error: {
                                        message: "Server is unable to delete the album."
                                    }
                                })
                            }

                        }
                        else{
                            res.json({
                                status: false,
                                error: {
                                    code: 403,
                                    message: "Access Forbidden"
                                }
                            })
                        }
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                code: 404,
                                message: "Album not found"
                            }
                        })
                    }
                }
                else if( option === 'all' ){
                    const albumData = await AlbumsModel.find({
                        userId: userId,
                        status: type
                    })
                    if( albumData ){
                        console.log("D")

                        /**
                         * iterate every album
                         */

                        albumData.map( async (oneAlbumData, index) => {
                            console.log("PO", oneAlbumData )
                            const albumProps = await AlbumPropsModel.find({
                                albumId: oneAlbumData.albumId
                            })
                            if( albumProps && albumProps.length === 1 ){


                                const files = albumProps[0].files
                                files.map( async ( item, index ) => {
                                    let file_path = process.env.USER_FILES + new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + userId + '/' + item
                                    await global.deleteFile( file_path )
                                    return true
                                })

                                const deletingAlbum = await AlbumsModel.deleteOne({
                                    albumId: albumProps[0].albumId
                                })

                                const deleteingAlbumProps = await AlbumPropsModel.deleteOne({
                                    albumId: albumProps[0].albumId
                                })
                            }
                        })
                        res.json({
                            status: true,
                            message: "All albums deleted successfully."
                        })
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                code: 404,
                                message: "No album found"
                            }
                        })
                    }
                }
                else{
                    res.json({
                        status: false,
                        error: {
                            message: "Wrong parameters"
                        }
                    })
                }
                
            }
            else{
                res.json({
                    status: false,
                    error: {
                        code: 500,
                        message: "Album not found"
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    code: 401,
                    message: "Please login first"
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                code: 500,
                message: "Server Error"
            }
        })
    }
})

























/* restore album */
router.post('/restore/:option', async (req, res, next) => {
    /**
     * option param can be "one" or "all". type of String
     */
    const sessionId = req.headers.sessionid || req.headers.sessionId
    const option = req.params.option
    console.log( "A" )
    try{
        const sessionData = await SessionModel.find({
            sessionId: sessionId,
            status: true
        })
        console.log(sessionData)
        if( sessionData && sessionData.length === 1 ){
            console.log("B")
            const sessionExpireTimestamp = new Date(sessionData[0].expire).getTime()
            const currentTimeStamp = Date.now()
            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                console.log("C")
                const userId = sessionData[0].userId


                if( option === 'one' ){
                    const albumId = req.headers.albumid
                    console.log("ALBUMID", albumId)
                    const albumData = await AlbumPropsModel.find({
                        albumId: albumId
                    })
                    if( albumData && albumData.length === 1 ){
                        console.log("D")
                        if( userId === albumData[0].userId ){
                            console.log("E")
                            /**
                             * update document in database
                             */
                            const updateAlbum = await AlbumsModel.updateOne({
                                albumId: albumId,
                                status: 'trashed'
                            },{
                                $set: {
                                    status: 'albums'
                                }
                            })

                            if( updateAlbum && updateAlbum.nModified === 1 ){
                                res.json({
                                    status: true,
                                    error: {
                                        message: "Album restored."
                                    }
                                })
                            }
                            else{
                                res.json({
                                    status: false,
                                    error: {
                                        message: "Server is unable to restore the album."
                                    }
                                })
                            }

                        }
                        else{
                            res.json({
                                status: false,
                                error: {
                                    code: 403,
                                    message: "Access Forbidden"
                                }
                            })
                        }
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                code: 404,
                                message: "Album not found"
                            }
                        })
                    }
                }
                else if( option === 'all' ){
                    const albumData = await AlbumsModel.find({
                        userId: userId,
                        status: 'trashed'
                    })
                    if( albumData ){
                        console.log("D")
                        const updateAlbum = await AlbumsModel.updateMany({
                            status: 'trashed'
                        },{
                            $set: {
                                status: 'albums'
                            }
                        })

                        if( updateAlbum ){
                            res.json({
                                status: true,
                                error: {
                                    message: "Album restored."
                                }
                            })
                        }
                        else{
                            res.json({
                                status: false,
                                error: {
                                    message: "Server is unable to restore the album."
                                }
                            })
                        }
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                code: 404,
                                message: "No album found"
                            }
                        })
                    }
                }
                else{
                    res.json({
                        status: false,
                        error: {
                            message: "Wrong parameters"
                        }
                    })
                }
                
            }
            else{
                res.json({
                    status: false,
                    error: {
                        code: 500,
                        message: "Album not found"
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    code: 401,
                    message: "Please login first"
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                code: 500,
                message: "Server Error"
            }
        })
    }
})







module.exports = router