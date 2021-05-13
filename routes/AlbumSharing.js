const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const SessionSchema = require('../schema/Sessions')
const ALbumPropSchema = require("../schema/Album")
const AlbumsSchema = require('../schema/Albums')
const UserSchema = require('../schema/Registration')


const Global = require('../classes/Global')

const router = express.Router()

const global = new Global


/**
 * models
 */
const SessionModel = new mongoose.model('Session', SessionSchema)
const UserModel = new mongoose.model("User", UserSchema)
const AlbumPropModel = new mongoose.model("Album_prop", ALbumPropSchema)
const AlbumsModel = new mongoose.model('Album', AlbumsSchema)
/**
 * get known users list
 */
router.get('/known-users', async (req, res, next) => {
    const sessionId = req.headers.sessionid || req.headers.sessionId
    /**
     * check for valid session and user must logged in
     */
    try{
        const userId = await global.validateUserLogin( req )
        // console.log( userId )
        if( (userId !== 0 && userId !== "0") && userId !== undefined ){
            const userData = await UserModel.find({
                userId: userId,
                status: true
            })
            // console.log(")")
            if( userData && userData.length === 1 ){
                // console.log("0")
                const knownUsers = userData[0].knownUsers
                // console.log("1")
                let arrayOfUserId = []
                knownUsers.map( item => {
                    // console.log("2")
                    let objOfUserId = { userId: item }
                    arrayOfUserId.push( objOfUserId )
                })
                // console.log( arrayOfUserId )
                const usersData = await UserModel.find({
                    $or: arrayOfUserId
                })
                // console.log(usersData)
                if( usersData && usersData.length !== 0 ){
                    // console.log("4")
                    // console.log( "ONE", oneUserData )
                    let arrayOfUserData = []
                    usersData.map((item, index) => {

                        let objOfUserData = {
                            userId: item.userId,
                            username: item.username,
                            email: item.email
                        }
                        arrayOfUserData.push( objOfUserData )
                        return true
                    })
                    res.json({
                        status: true,
                        knownUsers: arrayOfUserData
                    })
                }
                else{
                    res.json({
                        status: true,
                        knownUsers: []
                    })
                }
            }
            else{
                res.json({
                    status: false,
                    error: {
                        message: "No user found or Invalid user id"
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    message: "No user found or session timeout."
                }
            })
        }
    }catch( err ){
        res.json({
            status: false,
            error: {
                message: "Server error"
            }
        })
    }
})




router.get( '/userData/:userIds', async (req, res, next) => {
    const userIds = req.params.userIds
    const arrayOfUserId = userIds.split(',')
    let arrayOfUserIdInObj = []
    try{
        const userId = await global.validateUserLogin( req )
        // console.log( userId )
        if( (userId !== 0 && userId !== "0") && userId !== undefined ){
            const userData = await UserModel.find({
                userId: userId,
                status: true
            })
            // console.log(")")
            if( userData && userData.length === 1 ){

                arrayOfUserId.map( (item, index) => {
                    let obj = {
                        userId: item
                    }
                    arrayOfUserIdInObj.push( obj )
                })

                // console.log( arrayOfUserId )
                const usersData = await UserModel.find({
                    $or: arrayOfUserIdInObj
                })
                // console.log(usersData)
                if( usersData && usersData.length !== 0 ){
                    // console.log("4")
                    // console.log( "ONE", oneUserData )
                    let arrayOfUserData = []
                    usersData.map((item, index) => {

                        let objOfUserData = {
                            userId: item.userId,
                            username: item.username,
                            email: item.email
                        }
                        arrayOfUserData.push( objOfUserData )
                        return true
                    })
                    res.json({
                        status: true,
                        sharedWithUsers: arrayOfUserData
                    })
                }
                else{
                    res.json({
                        status: true,
                        sharedWithUsers: []
                    })
                }
            }
            else{
                res.json({
                    status: false,
                    error: {
                        message: "No user found or Invalid user id"
                    }
                })
            }
        }
        else{
            res.json({
                status: false,
                error: {
                    message: "No user found or session timeout."
                }
            })
        }
    }
    catch( err ){
        res.json({
            status: true,
            sharedWithUsers: []
        })
    }
})



router.get('/find-user/:email', async (req, res, json) => {
    const email = req.params.email
    console.log( email )
    try{
        const userId = await global.validateUserLogin( req )
        // console.log( userId )
        if( (userId !== 0 && userId !== "0") && userId !== undefined ){
            const userData = await UserModel.find({
                userId: userId,
                status: true
            })
            // console.log(")")
            if( userData && userData.length === 1 ){
                const foundUser = await UserModel.find({
                    email: email
                })
                console.log( foundUser )
                if( foundUser && foundUser.length === 1 && foundUser[0].userId !== userId ){
                    res.json({
                        status: true,
                        user: {
                            userId: foundUser[0].userId,
                            username: foundUser[0].username,
                            email: foundUser[0].email
                        }
                    })
                }
                else{
                    res.json({
                        status: true,
                        user: { }
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
        }
        else{
            res.json({
                status: false,
                error: {
                    message: "Please login in"
                }
            })
        }
    }
    catch( err ){
        console.log(err)
        res.json({
            status: false,
            error: {
                message: "Server error"
            }
        })
    }
})




/**
 * add to known users list
 */

router.post('/add-known-user', async( req, res, next ) => {
    const userIdToAdd = req.headers.userid
    console.log( userIdToAdd )
    try{
        const userId = await global.validateUserLogin( req )
        if( userId !== "0" && userId !== 0 ){
            const getKnownUsersList = await UserModel.find({
                userId: userId
            })
            if( getKnownUsersList && getKnownUsersList.length === 1 ){
                
                const knownUsersList = getKnownUsersList[0].knownUsers
                if( !knownUsersList.includes( userIdToAdd ) ){
                    let newListOfKnownUsers = knownUsersList
                    newListOfKnownUsers.push( userIdToAdd )
                    const updateStatus = await UserModel.updateOne({
                        userId: userId
                    },{
                        $set: {
                            knownUsers: newListOfKnownUsers
                        }
                    })
                    if( updateStatus && updateStatus.nModified === 1 ){
                        res.json({
                            status: true,
                            message: Success
                        })
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                message: "Unable to add the user to known users list"
                            }
                        })
                    }
                }
                else{
                    // already in known user list. no need to add
                    res.json({
                        status: true,
                        message: "Success"
                    })
                }
            }
            else{
                // no data found for the user
                res.json({
                    status: false,
                    error: {
                        message: "Unable to fetch user data."
                    }
                })
            }
        }
        else{
            // not logged in or session expired
            res.json({
                status: false,
                error: {
                    message: "Invalid or expired session. Login Again"
                }
            })
        }
    }
    catch( err ){
        console.log( err )
    }
})



/**
 * update sharing list
 */



router.post('/update/:userIds', async (req, res, next) => {
    const albumId = req.headers.albumid
    const userIds = req.params.userIds.split(',')
    console.log("A")
    /**
     * get all userIds list from the album_Props collection
     * to compare which users has been removed and which user is added in the new list
     */
    try{
        const userId = await global.validateUserLogin( req )
        // console.log( userId )
        if( (userId !== 0 && userId !== "0") && userId !== undefined ){
            const userData = await UserModel.find({
                userId: userId,
                status: true
            })
            // console.log(")")
            if( userData && userData.length === 1 ){
                const oldAlbumPropData = await AlbumPropModel.find({
                    albumId: albumId
                })
                console.log("B")
                if( oldAlbumPropData && oldAlbumPropData.length === 1 ){
                    console.log("C")
                    const oldUsersList = oldAlbumPropData[0].sharedWith
                    let removedUsersArray = []
                    let newUsersArray = []
                    userIds.map( userId => {
                        console.log("D")
                        if( !oldUsersList.includes( userId ) ){
                            newUsersArray.push( userId )
                        }
                    })
                    
                    console.log("E", newUsersArray)
                    oldUsersList.map( item => {
                        if( !userIds.includes( item ) ){
                            removedUsersArray.push( item )
                        }
                    })

                    /**
                     * now we have two arrays
                     * one have new added users list (userids)
                     * and another have removed users list (userIds)
                     * 
                     * now we will iterate both array to remove access and add access to the users collection
                     */

                    /**
                     * first we remove user access
                     */
                    console.log( "R", removedUsersArray )
                    removedUsersArray.map( async item => {
                        // delete albumId from users collection (sharedAlbums)
                        const userData = await UserModel.find({
                            userId: item
                        })
                        console.log("P", userData[0].sharedAlbums )
                        if( userData && userData.length === 1){
                            let newSharedWithArray = []
                            const sharedAlbums = userData[0].sharedAlbums
                            sharedAlbums.map( async (sharedAlbumId, i) => {
                                console.log("D", sharedAlbumId)
                                if( sharedAlbums[i] !== albumId ){
                                    console.log( sharedAlbumId )
                                    newSharedWithArray.push( sharedAlbumId )
                                }
                            })
                            console.log( "S", newSharedWithArray )
                            const updateUserDoc = await UserModel.updateOne({
                                userId: item
                            }, {
                                $set: {
                                    sharedAlbums: newSharedWithArray
                                }
                            })
                            if( updateUserDoc && updateUserDoc.nModified === 1 ){
                                return true
                            }
                        }
                        return true
                    })

                    /**
                     * add users to access the album
                     */

                    newUsersArray.map( async item => {
                        const userData = await UserModel.find({
                            userId: item
                        })
                        console.log( userData )
                        if( userData && userData.length === 1 ){
                            const sharedAlbums = userData[0].sharedAlbums
                            let newSharedWithArray = sharedAlbums
                            if( !newSharedWithArray.includes( albumId ) ){
                                newSharedWithArray.push( albumId )
                            }
                            const updateUserDoc = await UserModel.updateOne({
                                userId: item
                            }, {
                                $set: {
                                    sharedAlbums: newSharedWithArray
                                }
                            })
                            if( updateUserDoc && updateUserDoc.nModified === 1 ){
                                return true
                            }
                        }
                        return true
                    })

                    //---------------------------------------------------------------------------------
                    /**
                     * updating albumProp collection
                     * updateing the list of userIds in the sharedWith field
                     */
                    let userIdsToUpdate = []
                    if( userIds.includes('0') || userIds.includes(0) ){
                        userIdsToUpdate = []
                    }
                    else{
                        userIdsToUpdate = userIds
                    }
                    const updateStatus = await AlbumPropModel.updateOne({
                        albumId: albumId
                    },{
                        $set: {
                            sharedWith: userIdsToUpdate
                        }
                    })
                    const albumData = oldAlbumPropData
                    if( albumData[0].privacy === 'onlyme' ){
                        const updatePrivacy = await AlbumPropModel.updateOne({
                            albumId: albumId
                        },{
                            $set: {
                                privacy: 'specific'
                            }
                        })
                    }
                    /**
                     * update sharedAlbums fields on Users collection
                     */
                    // let userIdArrayofObj = []
                    // dataToUpdate.map( item => {
                    //     const obj = {
                    //         userId: item
                    //     }
                    //     userIdArrayofObj.push( obj )
                    //     return true
                    // })

                    // console.log( userIdArrayofObj)

                    // /**
                    //  * get all users data who has access to this album
                    //  */

                    // const allUsersOfThisAlbum = await UserModel.find({
                    //     $or: userIdArrayofObj
                    // })

                    

                    // if( updateStatus ){
                        res.json({
                            status: true,
                            message: "Success"
                        })
                    // }
                }
                else{
                    res.json({
                        status: false,
                        error: {
                            message: "No album found"
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
        }
        else{
            res.json({
                status: false,
                error: {
                    message: "Please login to access the resource"
                }
            })
        }
    }
    catch( err ){

    }
})

/** remove access for a user */
router.post('/remove-access', async (req,res,next) => {
    const albumId = req.headers.albumid
    try{    
        const userId = await global.validateUserLogin( req )
        if( userId !== 0 && userId !== "0" ){
            /**
             * check if album is shared with this user
             * get the sharedWith field from the album_props collection
             * check if userId exist in the sharedWith field
             */
            const albumProp = await AlbumPropModel.find({
                albumId: albumId
            })
            if( albumProp && albumProp.length === 1 ){
                const sharedWithList = albumProp[0].sharedWith
                if( sharedWithList.includes( userId ) ){
                    /**
                     * get the position of the userId in the sharedWith array
                     */
                    const position = sharedWithList.indexOf( userId )
                    let sharedUsersList = sharedWithList
                    sharedUsersList.splice(position, 1)
                    /**
                     * update data in the database
                     */
                    const updateStatus = await AlbumPropModel.updateOne({
                        albumId: albumId
                    },{
                        $set: {
                            sharedWith: sharedUsersList
                        }
                    })
                    if( updateStatus && updateStatus.nModified === 1 ){
                        /**
                         * delete albumId from the users collection in sharedAlbums filed
                         */
                        // get all albumsList
                        const userData = await UserModel.find({
                            userId: userId
                        })
                        if( userData && userData.length === 1 ){
                            const sharedAlbums = userData[0].sharedAlbums
                            if( sharedAlbums.includes( albumId ) ){
                                const positionOfAlbumId = sharedAlbums.indexOf( albumId )
                                let albumsList = sharedAlbums
                                albumsList.splice( position, 1)
                                // update albumList in users collection
                                const albumListUpdateStatus = await UserModel.updateOne({
                                    userId: userId
                                },{
                                    $set: {
                                        sharedAlbums: albumsList
                                    }
                                })
                                if( albumListUpdateStatus && albumListUpdateStatus.nModified === 1 ){
                                    res.json({
                                        status: true,
                                        message: "Success"
                                    })
                                }
                                else{
                                    // unable to update the users collection
                                    res.json({
                                        status: false,
                                        error: {
                                            message: "Unable to process your request."
                                        }
                                    })
                                }
                            }
                            else{
                                // not exist in the user Document
                                // no worry. this will not run the code to remove the albumid from the user document.
                                // we were doing the task to delete the albumid from the users collecetion but if already does not exist
                                // it's okay
                                res.json({
                                    status: true,
                                    message: "Success"
                                })
                            }
                        }
                        else{
                            // unable to get the user data from the userId
                            res.json({
                                status: false,
                                error: {
                                    message: "Server error"
                                }
                            })
                        }
                    }
                    else{
                        // unable to update the albumProps collection
                        res.json({
                            status: false,
                            error: {
                                message: "Server error"
                            }
                        })
                    }
                }
                else{
                    // not shared with this user
                    res.json({
                        status: false,
                        error: {
                            message: "Unauthorized request"
                        }
                    })
                }
            }
            else{
                // no album found
                res.json({
                    status: false,
                    error: {
                        message: "Invalid album Id"
                    }
                })
            }
        }
        else{
            // invalid userId or session expired
            res.json({
                status: false,
                error: {
                    message: "Session expired or login again"
                }
            })
        }
    }
    catch( err ){

    }
})
module.exports = router