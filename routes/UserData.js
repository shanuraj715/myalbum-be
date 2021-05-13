const express = require('express')
const mongoose = require('mongoose')

const UserSchema = require('../schema/Registration')
const SessionSchema = require('../schema/Sessions')
const UserDataSchema = require('../schema/UserData')
const AlbumsSchema = require('../schema/Albums')
const AlbumSchema = require('../schema/Album')

const dotenv = require('dotenv').config()


const router = express.Router()




/**
 * Modals
 */
const UserModel = new mongoose.model("User", UserSchema)
const SessionModel = new mongoose.model("Session", SessionSchema)
const UserDataModel = new mongoose.model("Userdata", UserDataSchema)
const AlbumsModel = new mongoose.model("Album", AlbumsSchema)
const AlbumModel = new mongoose.model("Album_prop", AlbumSchema)


const getAllPublicAlbums = async (userId ) => {
    // albumFor is for owner or another user
    let albumList = []
    
    const albums_prop = await AlbumModel.find({
        userId: userId,
        privacy: 'public'
    }, { privacy: 1, albumId: 1 })

    if( albums_prop && albums_prop.length !== 0 ){
        const promise = albums_prop.map( async (item, index) => {
            const oneAlbum = await AlbumsModel.find({
                userId: userId,
                albumId: item.albumId
            })
            if( oneAlbum[0].status === 'albums' && !oneAlbum[0].blocked ){
                const obj = {
                    userId: userId,
                    albumId: oneAlbum[0].albumId,
                    privacy: item.privacy,
                    name: oneAlbum[0].name
                }
                albumList.push( obj )
            }
        })
        
        const wait = await Promise.all( promise )
        return albumList
    }
    return albumList
}





const getAllOwnerAlbums = async (userId ) => {
    // albumFor is for owner or another user
    let albumList = []
    
    const albums_prop = await AlbumModel.find({
        userId: userId,
    }, { privacy: 1, albumId: 1 })

    if( albums_prop && albums_prop.length !== 0 ){
        const promise = albums_prop.map( async (item, index) => {
            const oneAlbum = await AlbumsModel.find({
                userId: userId,
                albumId: item.albumId
            })
            if( oneAlbum[0].status === 'albums' && !oneAlbum[0].blocked ){
                const obj = {
                    userId: userId,
                    albumId: oneAlbum[0].albumId,
                    privacy: item.privacy,
                    name: oneAlbum[0].name
                }
                albumList.push( obj )
            }
        })
        
        const wait = await Promise.all( promise )
        return albumList
    }
    return albumList
}




const request = async ( username, ownerRequestOrNot ) => {
    try{
        const userData = await UserModel.find({
            username: username,
            status: true,
            accountVerified: true
        })
        const userDataToReturn = {}
        if( userData && userData.length !== 0 ){
            const userId = userData[0].userId
            const firstName = userData[0].firstName
            const lastName = userData[0].lastName
            const email = userData[0].email
            const albums = ownerRequestOrNot ? await getAllOwnerAlbums( userId ) : await getAllPublicAlbums( userId )

            userDataToReturn.userId = userId
            userDataToReturn.firstName = firstName
            userDataToReturn.lastName = lastName
            userDataToReturn.email = email
            userDataToReturn.albums = albums
            userDataToReturn.username = username


            const userPropData = await UserDataModel.find({
                userId: userId
            })
            if( userPropData && userPropData.length === 1 ){
                const profilePic = userPropData[0].profileImage
                const coverPic = userPropData[0].coverImage
                const gender = userPropData[0].gender
                const bio = userPropData[0].bio
                const dob = userPropData[0].dob
                const socialProfiles = userPropData[0].social

                userDataToReturn.profileImage = profilePic
                userDataToReturn.coverImage = coverPic
                userDataToReturn.gender = gender
                userDataToReturn.bio = bio
                userDataToReturn.dob = dob
                userDataToReturn.socialProfiles = socialProfiles
            }
            else{
                userDataToReturn.profileImage = ''
                userDataToReturn.coverImage = ''
                userDataToReturn.gender = ''
                userDataToReturn.bio = ''
                userDataToReturn.dob = ''
                userDataToReturn.socialProfiles = {}
            }
            return userDataToReturn
        }
    }
    catch( err ){
        throw new Error( err )
    }
}




router.get('/:username', async (req, res, next) => {
    const username = req.params.username
    const sessionId = req.headers.sessionid || req.headers.sessionId
    
    try{
        // check if sessionid sent or not.
        // if sessionid is not present in the header then process this request
        // as an guest user or not logged in user
        if( sessionId === undefined || sessionId === '' ){
            const data = await request( username, false )
            if( data.userId ){
                res.json({
                    status: true,
                    data: data
                })
            }
            else{
                res.json({
                    status: false,
                    error: {
                        message: "Invalid Request"
                    }
                })
            }
        }
        else{
            const sessionData = await SessionModel.find({
                sessionId: sessionId,
                status: true
            })
            
            if( sessionData && sessionData.length === 1 ){
                const userid = sessionData[0].userId
                if( sessionData[0].username !== username ){
                    const data = await request( username, false )
                    if( data.userId ){
                        res.json({
                            status: true,
                            data: data
                        })
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                message: "Invalid Request"
                            }
                        })
                    }
                }
                else{
                    const data = await request( username, true )
                    if( data.userId ){
                        res.json({
                            status: true,
                            data: data
                        })
                    }
                    else{
                        res.json({
                            status: false,
                            error: {
                                message: "Invalid Request"
                            }
                        })
                    } 
                }
            }
            else{
                res.json({
                    status: false,
                    error: {
                        message: "Invalid request. Invalid session"
                    }
                })
            }
        }
    }
    catch( err ){
        res.json({
            status: false,
            error: {
                message: "Server error."
            }
        })
    }
})

module.exports = router