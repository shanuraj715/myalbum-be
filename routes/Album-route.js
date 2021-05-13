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

validateAlbum = async ( albumId ) => {
    // console.log( albumId )
    const albumData = await AlbumsModel.find({
        albumId: albumId
    })
    // console.log( albumData )
    if( albumData ){
        return albumData
    }
}

const fileEncNameToHttpPathConverter = ( files_in_array, userId, userRegDate ) => {
    const array_to_return = []

    for( let i=0; i< files_in_array.length; i++ ){
        let string = ("http://localhost:5000/Uploads/Users/" + new Date(userRegDate).getFullYear() + '/' + (new Date(userRegDate).getMonth() + 1) + '/' + userId + '/' + files_in_array[i])
        array_to_return.push( string )
    }
    return array_to_return
}


router.get('/:albumid/:sessionId', async ( req, res, next ) => {
    // console.clear()
    // console.log("1")
    const albumId = req.params.albumid
    const sessionId = req.params.sessionId
    try{

        const albumData = await validateAlbum( albumId )
        // console.log( albumData )
        if( albumData.length === 1 ){
            // console.log("2")
            const userData = await UserModel.find({
                userId: albumData[0].userId
            })
            if( userData && userData.length === 1 ){
                const userAccountStatus = userData[0].status
                if( !userAccountStatus ){
                    res.json({
                        status: false,
                        error: {
                            code: 403,
                            message: "Account disabled"
                        }
                    })
                    return false
                }
            }
            if( albumData.length && albumData[0].status !== 'trashed' ){
                const userId = albumData[0].userId
                /**
                 * to create a http url of the files
                 * we are making a constant for user registration date
                 */
                const userRegDate = userData[0].regDate
                const albumName = albumData[0].name
                const albumId = albumData[0].albumId
                const creation = albumData[0].createdAt
                const modified = albumData[0].updatedAt

                const albumPropsData = await AlbumModel.find({
                    albumId: albumId
                })
                if( albumPropsData.length && albumPropsData.length === 1 ){
                    const privacy = albumPropsData[0].privacy
                    const theme = albumPropsData[0].theme
                    const starred = albumPropsData[0].starred
                    const color = albumPropsData[0].color
                    const name = albumPropsData[0].name
                    const title = albumPropsData[0].title
                    const description = albumPropsData[0].description
                    const sharedWith = albumPropsData[0].sharedWith
                    const files = albumPropsData[0].files

                    const sessiondata = await SessionModel.find({
                        sessionId: sessionId || 0,
                        status: true
                    })
                    // console.log( sessiondata.length )
                    if( sessiondata.length && sessiondata.length === 1 ){
                        if( sessiondata[0].userId === userId ){
                            const sessionExpireTimestamp = new Date(sessiondata[0].expire).getTime()
                            const currentTimeStamp = Date.now()
                            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                                res.json({
                                    status: true,
                                    albumData: {
                                        userId: userId,
                                        albumId: albumId,
                                        albumName: name,
                                        albumTitle: title,
                                        albumDescription: description,
                                        createdAt: creation,
                                        lastModified: modified,
                                        privacy: privacy,
                                        theme: theme,
                                        starred: starred,
                                        color: color,
                                        sharedWith: sharedWith,
                                        files: fileEncNameToHttpPathConverter( files, userId, userRegDate )
                                    }   
                                })
                            }
                            else{
                                res.json({
                                    status: false,
                                    error: {
                                        code: 403,
                                        message:"Session expired. Please Login"
                                    }
                                })
                            }
                        }
                        else{
                            if( privacy === 'public' ){
                                res.json({
                                    status: true,
                                    albumData: {
                                        userId: userId,
                                        albumId: albumId,
                                        albumName: name,
                                        albumTitle: title,
                                        albumDescription: description,
                                        createdAt: creation,
                                        theme: theme,
                                        files: fileEncNameToHttpPathConverter( files, userId, userRegDate )
                                    }   
                                })
                            }
                            if( privacy === 'onlyme' ){
                                res.json({
                                    status: false,
                                    error: {
                                        code: 404,
                                        message: "Album not found or album is not shared 1"
                                    } 
                                })
                            }
                            if( privacy === 'unlisted' ){
                                res.json({
                                    status: true,
                                    albumData: {
                                        userId: userId,
                                        albumId: albumId,
                                        albumName: name,
                                        albumTitle: title,
                                        albumDescription: description,
                                        createdAt: creation,
                                        theme: theme,
                                        files: fileEncNameToHttpPathConverter( files, userId, userRegDate )
                                    }   
                                })
                            }
                            if( privacy === 'specific' ){
                                /**
                                 * check album access permission
                                 */
                                let shared_flag = false
                                albumPropsData[0].sharedWith.map( (item, index) => {
                                    console.log( sessiondata[0].userId, item)
                                    if( sessiondata[0].userId === parseInt(item) ){
                                        shared_flag = true
                                    }
                                })
                                if( shared_flag ){
                                    res.json({
                                        status: true,
                                        albumData: {
                                            userId: userId,
                                            albumId: albumId,
                                            albumName: name,
                                            albumTitle: title,
                                            albumDescription: description,
                                            createdAt: creation,
                                            theme: theme,
                                            files: fileEncNameToHttpPathConverter( files, userId, userRegDate )
                                        }   
                                    })
                                }
                                else{
                                    res.json({
                                        status: false,
                                        error: {
                                            code: 404,
                                            message: "Album not found or album is not shared"
                                        } 
                                    })
                                }
                            }
                            else{
                                res.json({
                                    status: false,
                                    error: {
                                        code: 500,
                                        message: "Invalid album privacy property in the database"
                                    }
                                })
                            }
                        }
                        
                    }
                    else{
                        if( privacy === 'public' ){
                            res.json({
                                status: true,
                                albumData: {
                                    userId: userId,
                                    albumId: albumId,
                                    albumName: name,
                                    albumTitle: title,
                                    albumDescription: description,
                                    createdAt: creation,
                                    theme: theme,
                                    files: fileEncNameToHttpPathConverter( files, userId, userRegDate )
                                }   
                            })
                        }
                        if( privacy === 'onlyme' ){
                            res.json({
                                status: false,
                                error: {
                                    code: 404,
                                    message: "Album not found."
                                } 
                            })
                        }
                        if( privacy === 'unlisted' ){
                            res.json({
                                status: true,
                                albumData: {
                                    userId: userId,
                                    albumId: albumId,
                                    albumName: name,
                                    albumTitle: title,
                                    albumDescription: description,
                                    createdAt: creation,
                                    theme: theme,
                                    files: fileEncNameToHttpPathConverter( files, userId, userRegDate )
                                }   
                            })
                        }
                        if( privacy === 'specific' ){
                            res.json({
                                status: false,
                                error: {
                                    code: 404,
                                    message: "Album not found"
                                }
                            })
                        }
                        else{
                            res.json({
                                status: false,
                                error: {
                                    code: 500,
                                    message: "Invalid album privacy property in the database"
                                }
                            })
                        }
                    }
                }
                else{
                    res.json({
                        status: false,
                        error: {
                            code: 500,
                            message: "server is unable to get the album data from the database"
                        }
                    })
                }
            }
            else{
                res.json({
                    status: false,
                    error: {
                        code: 404,
                        message: "No album found 1"
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
    catch(err){
        console.log( err )
    }
})

/**
 * for uploading files to this album
 */

router.post('/upload-file/:albumId', async (req, res, next) => {
    const albumId = req.params.albumId
    const sessionId = req.headers.sessionid || req.headers.sessionId
    try{
        const sessionData = await SessionModel.find({
            sessionId: sessionId,
            status: true
        })
        if( sessionData && sessionData.length === 1 ){
            const sessionExpireTimestamp = new Date(sessionData[0].expire).getTime()
            const currentTimeStamp = Date.now()
            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                const userId = sessionData[0].userId
                const albumData = await AlbumModel.find({
                    albumId: albumId
                })
                if( albumData && albumData.length === 1 ){
                    if( userId === albumData[0].userId ){
                        const userData = await UserModel.find({
                            userId: userId,
                            status: true
                        })
        
                        if( !userData && userData.length !== 1 ){
                            res.json({
                                status: false,
                                error: {
                                    message: "Server returned an invalid response"
                                }
                            })
                        }
                        else{
        
                            if( !req.files || !req.files.file ){
                                res.json({
                                    status: false,
                                    error: {
                                        message: "No files were uploaded"
                                    }
                                })
                            }
                            else{
        
                                const file = req.files.file
        
                                if( file.size > process.env.MAX_FILE_SIZE ){
                                    res.json({
                                        status: false,
                                        error: {
                                            message: "File too large"
                                        }
                                    })
                                }
                                else{
        
                                    const path_for_file = process.env.USER_FILES + new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + userId + '/'
        
                                    if( !global.directoryExists( path_for_file )){
                                        global.directoryCreate( path_for_file )
                                    }
        
                                    const file_new_name = global.generateUserFilesName( file.name )
        
                                    const fileDataToInsert = {
                                        userId: userId,
                                        fileName: file.name,
                                        fileEncName: file_new_name,
                                        size: file.size
                                    }
                                    const insertIntoFilesCollection = await FileModel.insertMany( [fileDataToInsert])
        
                                    if( insertIntoFilesCollection.length === 1 ){
                                        /**
                                         * update file list in the album document 
                                         */
                                        const updateAlbumFileList = await AlbumModel.updateOne({
                                            albumId: albumId
                                        }, {
                                            $push: {
                                                "files": file_new_name
                                            }
                                        })
                                        
                                        file.mv( path_for_file + file_new_name, err => {
                                            if( err ){
                                                res.json({
                                                    status: false,
                                                    error: {
                                                        message: "Server Error. Unable to upload the file"
                                                    }
                                                })
                                            }
                                            else{
                                                setTimeout( () => {
                                                    res.json({
                                                        status: true,
                                                        message: "Success"
                                                    })
                                                }, 500)
                                            }
                                        })
                                    }
                                    else{
                                        res.json({
                                            status: false,
                                            error: {
                                                message: "Failed1"
                                            }
                                        })
                                    }
                                    
                                }
                            }
                        }
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                message: "Forbidden"
                            }
                        })
                    }
                }
                else{
                    res.json({
                        status: false,
                        error: {
                            message: "Server returned an error."
                        }
                    })
                }
                
            }
            else{
                res.json({
                    status: false,
                    error: {
                        message: "Session expired"
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    message: "No active session found"
                }
            })
        }
    }
    catch( err ){
        if( !res.headersSent ){
            // res.json({
            //     status: false,
            //     error: {
            //         message: "Server Error"
            //     }
            // })
        } 
    }
})

module.exports = router