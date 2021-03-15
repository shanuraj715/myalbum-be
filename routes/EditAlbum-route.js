const express = require('express')
const mongoose = require('mongoose')
const AlbumSchema = require('../schema/Albums')
const AlbumPropsSchema = require('../schema/Album')
const UserSchema = require('../schema/Registration')
const SessionSchema = require('../schema/Sessions')
const FilesSchema = require('../schema/Files')

const router = express.Router()

/**
 * modals
 */
const AlbumModel = new mongoose.model('Album', AlbumSchema)
const AlbumPropsModel = new mongoose.model('Album_prop', AlbumPropsSchema)
const UserModel = new mongoose.model('User', UserSchema)
const SessionModel = new mongoose.model("Session", SessionSchema)
const FilesModel = new mongoose.model('file', FilesSchema)


const files = []

const settings = {
    name: 'My Love Photos',
    title: 'Sweet Love',
    description: 'This album contains all my favourite images.',
    theme: 'Classic Love',
    privacy: 'specific',
    colorClasses: 'diou_blue',
    sharedWith: [
        {
            userid: 123453,
            username: 'shanuraj717',
            email: 'shanuraj717@gmail.com'
        },
        {
            userid: 123454,
            username: 'shanuraj718',
            email: 'shanuraj718@gmail.com'
        }
    ]
}

const album_data = {
    files: files,
    settings: settings
}


router.get('/files/:albumid', async ( req, res, next ) => {
    const sessionId = req.headers.sessionid || req.params.sessionid
    const albumId = req.params.albumid

    try{
        /**
         * validate session
         * check if session exists, not expired
         */
        const session = await SessionModel.find({
            sessionId: sessionId
        })
        if( session.length === 1 ){
            const sessionExpireTimestamp = new Date(session[0].expire).getTime()
            const currentTimeStamp = Date.now()
            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                /**
                 * session found and not Expired
                 * valid session
                 */
                const userId = session[0].userId
                /**
                 * check if user account is not blocked by the system or admin
                 */
                const user = await UserModel.find({
                    userId: userId
                })
                if( user.length === 1 ){
                    /**
                     * user account found
                     * check for further validations
                     * like
                     * not blocked account
                     */
                    if( user[0].status ){
                        /**
                         * account not blocked
                         * check if album exist and belong to that user
                         */
                        const albums = await AlbumModel.find({
                            albumId: albumId
                        })
                        if( albums.length === 1 ){
                            /**
                             * album found
                             * check if user is the owner of the album
                             */
                            if( albums[0].userId === userId ){
                                /**
                                 * user is the owner of album
                                 * check for blocked album
                                 */
                                if( !albums[0].blocked ){
                                    /**
                                     * album not blocked
                                     */
                                    /**
                                     * get album data
                                     */
                                    const albumPropsData = await AlbumPropsModel.find({
                                        albumId: albumId
                                    })
                                    if( albumPropsData.length === 1 ){
                                        /**
                                         * album found in the album_props collecion
                                         * get files data from files collection
                                         */

                                        let allFiles = []
                                        for( let i=0; i < albumPropsData[0].files.length; i++ ){
                                            
                                            let obj = {
                                                fileEncName: albumPropsData[0].files[i]
                                            }
                                            allFiles.push( obj )
                                        }
                                        if( allFiles.length !== 0 ){
                                            const filesData = await FilesModel.find({
                                                $or: allFiles
                                            })
                                            if( filesData.length ){
                                                allFiles = []
                                                filesData.map( (item, index) => {
                                                    let obj = {
                                                        name: item.fileName,
                                                        enc_name: item.fileEncName,
                                                        url: ("http://localhost:5000/Uploads/Users/" + new Date(user[0].regDate).getFullYear() + '/' + (new Date(user[0].regDate).getMonth() + 1) + '/' + user[0].userId + '/' + item.fileEncName)
                                                    }
                                                    allFiles.push( obj )
                                                    return true
                                                })
                                            }
    
    
                                            if( allFiles.length ){
                                                res.json({
                                                    status: true,
                                                    files: allFiles
                                                })
                                            }
                                            else{

                                            }
                                        }
                                        else{
                                            res.json({
                                                status: true,
                                                files: []
                                            })
                                        }

                                        
                                        

                                        
                                    }
                                }
                                else{
                                    /**
                                     * blocked album
                                     */
                                    res.json({
                                        status: false,
                                        error: {
                                            message: "01"
                                        }
                                    })
                                }
                                
                            }
                            else{
                                /**
                                 * user is not the owner of the album
                                 */
                                res.json({
                                    status: false,
                                    error: {
                                        message: "02"
                                    }
                                })
                            }
                        }
                        else{
                            /**
                             * no album found
                             */
                            res.json({
                                status: false,
                                error: {
                                    message: "03"
                                }
                            })
                        }
                    }
                    else{
                        /**
                         * blocked account
                         */
                        res.json({
                            status: false,
                            error: {
                                message: "04"
                            }
                        })
                    }
                }
                else{
                    /**
                     * user account not found
                     */
                    res.json({
                        status: false,
                        error: {
                            message: "05"
                        }
                    })
                }
            }
            else{
                /**
                 * expired session
                 */
                res.json({
                    status: false,
                    error: {
                        message: "06"
                    }
                })
            }
        }
        else{
            /**
             * no session found
             * user not logged in
             */
            res.json({
                status: false,
                error: {
                    message: "07"
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                message: err
            }
        })
    }
    
})

router.get('/settings/:albumid', async ( req, res, next ) => {
    const sessionId = req.headers.sessionId || req.headers.sessionid
    const albumId = req.params.albumid


    try{
        /**
         * validate session
         * check if session exists, not expired
         */
        const session = await SessionModel.find({
            sessionId: sessionId
        })
        
        if( session.length === 1 ){
            const sessionExpireTimestamp = new Date(session[0].expire).getTime()
            const currentTimeStamp = Date.now()
            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                /**
                 * session found and not Expired
                 * valid session
                 */
                const userId = session[0].userId
                /**
                 * check if user account is not blocked by the system or admin
                 */
                const user = await UserModel.find({
                    userId: userId
                })
                if( user.length === 1 ){
                    /**
                     * user account found
                     * check for further validations
                     * like
                     * not blocked account
                     */
                    if( user[0].status ){
                        /**
                         * account not blocked
                         * check if album exist and belong to that user
                         */
                        const albums = await AlbumModel.find({
                            albumId: albumId
                        })
                        if( albums.length === 1 ){
                            /**
                             * album found
                             * check if user is the owner of the album
                             */
                            if( albums[0].userId === userId ){
                                /**
                                 * user is the owner of album
                                 * check for blocked album
                                 */
                                if( !albums[0].blocked ){
                                    /**
                                     * album not blocked
                                     */
                                    /**
                                     * get album data
                                     */
                                    const albumPropsData = await AlbumPropsModel.find({
                                        albumId: albumId
                                    })
                                    if( albumPropsData.length === 1 ){
                                        /**
                                         * album found in the album_props collecion
                                         * get files data from files collection
                                         */

                                            const settings = {
                                                name: albumPropsData[0].name,
                                                title: albumPropsData[0].title,
                                                description: albumPropsData[0].description,
                                                theme: albumPropsData[0].theme,
                                                privacy: albumPropsData[0].privacy,
                                                colorClasses: albumPropsData[0].color,
                                                sharedWith: albumPropsData[0].sharedWith
                                            }
    
                                            res.json({
                                                status: true,
                                                settings: settings
                                            })
                                    
                                        
                                        

                                        
                                    }
                                }
                                else{
                                    /**
                                     * blocked album
                                     */
                                    res.json({
                                        status: false,
                                        error: {
                                            message: "01"
                                        }
                                    })
                                }
                                
                            }
                            else{
                                /**
                                 * user is not the owner of the album
                                 */
                                res.json({
                                    status: false,
                                    error: {
                                        message: "02"
                                    }
                                })
                            }
                        }
                        else{
                            /**
                             * no album found
                             */
                            res.json({
                                status: false,
                                error: {
                                    message: "03"
                                }
                            })
                        }
                    }
                    else{
                        /**
                         * blocked account
                         */
                        res.json({
                            status: false,
                            error: {
                                message: "04"
                            }
                        })
                    }
                }
                else{
                    /**
                     * user account not found
                     */
                    res.json({
                        status: false,
                        error: {
                            message: "05"
                        }
                    })
                }
            }
            else{
                /**
                 * expired session
                 */
                res.json({
                    status: false,
                    error: {
                        message: "06"
                    }
                })
            }
        }
        else{
            /**
             * no session found
             * user not logged in
             */
            res.json({
                status: false,
                error: {
                    message: "07"
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                message: err
            }
        })
    }
    // setTimeout(() => {
    //     res.json({
    //         settings: album_data.settings
    //     })
    // }, 1000)
    
})












router.post('/settings', async (req, res, next) => {
    const albumId = req.headers.albumId || req.headers.albumid
    const sessionId = req.headers.sessionid
    try{
        /**
         * validate session
         * check if session exists, not expired
         */
        const session = await SessionModel.find({
            sessionId: sessionId
        })
        
        if( session.length === 1 ){
            const sessionExpireTimestamp = new Date(session[0].expire).getTime()
            const currentTimeStamp = Date.now()
            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                /**
                 * session found and not Expired
                 * valid session
                 */
                const userId = session[0].userId
                /**
                 * check if user account is not blocked by the system or admin
                 */
                const user = await UserModel.find({
                    userId: userId
                })
                if( user.length === 1 ){
                    /**
                     * user account found
                     * check for further validations
                     * like
                     * not blocked account
                     */
                    if( user[0].status ){
                        /**
                         * account not blocked
                         * check if album exist and belong to that user
                         */
                        const albums = await AlbumModel.find({
                            albumId: albumId
                        })
                        if( albums.length === 1 ){
                            /**
                             * album found
                             * check if user is the owner of the album
                             */
                            if( albums[0].userId === userId ){
                                /**
                                 * user is the owner of album
                                 * check for blocked album
                                 */
                                if( !albums[0].blocked ){
                                    /**
                                     * storing data into album_props collection
                                     */

                                    // const dataToUpdate = req.body
                                    const status = await AlbumPropsModel.updateOne({
                                        albumId: albumId
                                    }, {
                                        $set: {
                                            privacy: req.body.privacy,
                                            theme: req.body.theme,
                                            color: req.body.colorClass,
                                            name: req.body.name,
                                            title: req.body.title,
                                            description: req.body.description
                                        }
                                    })

                                    /**
                                     * update album name in albums collection
                                     */

                                    const albumsCollectionUpdationStatus = await AlbumModel.updateOne({
                                        albumId: albumId
                                    }, {
                                        $set: {
                                            name: req.body.name
                                        }
                                    })
                                    console.log( status )
                                    if( status.length !== undefined || status.length !== null ){
                                        setTimeout( () => {
                                            res.json({
                                                status: true,
                                                message: "Success"
                                            })
                                        }, 1500)
                                    }
                                    else{
                                        res.json({
                                            status: false,
                                            error: {
                                                message: "Unable to update album"
                                            }
                                        })
                                    }
                                }
                                else{
                                    /**
                                     * blocked album
                                     */
                                    res.json({
                                        status: false,
                                        error: {
                                            message: "Album was blocked"
                                        }
                                    })
                                }
                                
                            }
                            else{
                                /**
                                 * user is not the owner of the album
                                 */
                                res.json({
                                    status: false,
                                    error: {
                                        message: "Unauthorized User Request"
                                    }
                                })
                            }
                        }
                        else{
                            /**
                             * no album found
                             */
                            res.json({
                                status: false,
                                error: {
                                    message: "Album not found"
                                }
                            })
                        }
                    }
                    else{
                        /**
                         * blocked account
                         */
                        res.json({
                            status: false,
                            error: {
                                message: "User account was blocked"
                            }
                        })
                    }
                }
                else{
                    /**
                     * user account not found
                     */
                    res.json({
                        status: false,
                        error: {
                            message: "No user found."
                        }
                    })
                }
            }
            else{
                /**
                 * expired session
                 */
                res.json({
                    status: false,
                    error: {
                        message: "Session Expired. Please login"
                    }
                })
            }
        }
        else{
            /**
             * no session found
             * user not logged in
             */
            res.json({
                status: false,
                error: {
                    message: "Please login first"
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                message: "Server error"
            }
        })
    }
})














router.post('/files', async (req, res, next) => {
    const albumId = req.headers.albumId || req.headers.albumid
    const sessionId = req.headers.sessionid
    try{
        /**
         * validate session
         * check if session exists, not expired
         */
        const session = await SessionModel.find({
            sessionId: sessionId
        })
        
        if( session.length === 1 ){
            const sessionExpireTimestamp = new Date(session[0].expire).getTime()
            const currentTimeStamp = Date.now()
            if( sessionExpireTimestamp - currentTimeStamp > 0 ){
                /**
                 * session found and not Expired
                 * valid session
                 */
                const userId = session[0].userId
                /**
                 * check if user account is not blocked by the system or admin
                 */
                const user = await UserModel.find({
                    userId: userId
                })
                if( user.length === 1 ){
                    /**
                     * user account found
                     * check for further validations
                     * like
                     * not blocked account
                     */
                    if( user[0].status ){
                        /**
                         * account not blocked
                         * check if album exist and belong to that user
                         */
                        const albums = await AlbumModel.find({
                            albumId: albumId
                        })
                        if( albums.length === 1 ){
                            /**
                             * album found
                             * check if user is the owner of the album
                             */
                            if( albums[0].userId === userId ){
                                /**
                                 * user is the owner of album
                                 * check for blocked album
                                 */
                                if( !albums[0].blocked ){
                                    /**
                                     * storing data into album_props collection
                                     */

                                    // const dataToUpdate = req.body
                                    
                                    const status = await AlbumPropsModel.updateOne({
                                        albumId: albumId
                                    }, {
                                        $set: {
                                            files: req.body.data
                                        }
                                    })
                                    console.log( status )
                                    if( status.length !== undefined || status.length !== null ){
                                        
                                        setTimeout( () => {
                                            res.json({
                                                status: true,
                                                message: "Success"
                                            })
                                        }, 2800)
                                    }
                                    else{
                                            res.json({
                                            status: false,
                                            error: {
                                                message: "Unable to update album"
                                            }
                                        })
                                    }
                                }
                                else{
                                    /**
                                     * blocked album
                                     */
                                    res.json({
                                        status: false,
                                        error: {
                                            message: "Album was blocked"
                                        }
                                    })
                                }
                                
                            }
                            else{
                                /**
                                 * user is not the owner of the album
                                 */
                                res.json({
                                    status: false,
                                    error: {
                                        message: "Unauthorized User Request"
                                    }
                                })
                            }
                        }
                        else{
                            /**
                             * no album found
                             */
                            res.json({
                                status: false,
                                error: {
                                    message: "Album not found"
                                }
                            })
                        }
                    }
                    else{
                        /**
                         * blocked account
                         */
                        res.json({
                            status: false,
                            error: {
                                message: "User account was blocked"
                            }
                        })
                    }
                }
                else{
                    /**
                     * user account not found
                     */
                    res.json({
                        status: false,
                        error: {
                            message: "No user found."
                        }
                    })
                }
            }
            else{
                /**
                 * expired session
                 */
                res.json({
                    status: false,
                    error: {
                        message: "Session Expired. Please login"
                    }
                })
            }
        }
        else{
            /**
             * no session found
             * user not logged in
             */
            res.json({
                status: false,
                error: {
                    message: "Please login first"
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                message: "Server error"
            }
        })
    }
})


module.exports = router