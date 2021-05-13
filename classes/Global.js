const mongoose = require('mongoose')
const Sessions = require('../schema/Sessions')
const fs = require('fs')
const { dir } = require('console')

class Global{
    fileEncryptionSalt = () => {
        const array_of_chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
        let salt = ''
        for( let i=0; i< 22; i++ ){
            salt += array_of_chars[Math.ceil(Math.random() * (array_of_chars.length - 1))]
        }
        return salt
    }

    generateAlbumId = () => {
        const array_of_chars = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','-','_']
        let id = ''
        for( let i=0; i < 64; i++ ){
            id += array_of_chars[Math.ceil(Math.random() * (array_of_chars.length - 1))]
        }
        return id
    }

    validateUserLogin = async req => {
        /**
         * validating user logged in using session cookie
         * cookie name : sessionId
         */
        let sessionId = req.params.sessionId || req.params.sessionid
        if( sessionId === 0 || sessionId === undefined ){
            sessionId = req.headers.sessionid || req.headers.sessionId
        }
        const SessionModel = new mongoose.model("Session", Sessions)
        const findSessionData = await SessionModel.find({
            sessionId: sessionId
        })
        let userId = 0
        if( findSessionData.length === 1 && findSessionData[0].status ){
            return findSessionData[0].userId
        }
        else{
            return "0"
        }
    }

    generateActivationString = () => {
        const array_of_chars = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','-','_']
        let str = ''
        for( let i=0; i < 32; i++ ){
            str += array_of_chars[Math.ceil(Math.random() * (array_of_chars.length - 1))]
        }
        return str
    }

    directoryExists = ( path ) => {
        if( fs.existsSync( path )){
            return true
        }
        else{
            return false
        }
    }

    directoryCreate = async path => {
        // console.log( path )
        let dirs = path.split('/')
        let initial_path = ''
        dirs.map( item => {
            if( item !== '' ){
                initial_path += item + '/'
                if( !fs.existsSync( initial_path )){
                    fs.mkdirSync( initial_path, err => {
                        if( err ){
                            // throw new Error("Directory creation failed")
                        }
                    })
                }
            }
            return true
            
        })
        // console.log( this.directoryExists( path ) )
        if( this.directoryExists( path ) ){
            return true
        }
        else{
            return false
        }
    }

    generateAppFilesName = file_name => {
        /**
         * accept the name of the file
         * create a new file name and change the file name
         * with new generated name
         * and then merger the file extension with the file name
         */

        let file_name_array = file_name.split('.')
        const file_name_length = file_name.length

        let file_name_without_ext = ''
        for( let i=0; i < file_name_array.length - 1; i++ ){
            file_name_without_ext += file_name_array[i]
        }
        if( file_name_without_ext.length > 20 ){
            file_name_without_ext = file_name_without_ext.substring(0, 20)
        }
        const file_extension = file_name.split('.').pop()
        const array_of_chars = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9']
        
        
        let str1 = Date.now()
        
        
        let str2 = ''
        for( let i=0; i < 4; i++ ){
            str2 += array_of_chars[Math.ceil(Math.random() * (array_of_chars.length - 1))]
        }

        /**
         * new file name patter will be 
         * timestamp_in_milli_seconds + random_4_character_string + first_20_chars_of_file_name + extension
         * ex: 1613233184383AbcdMyPhoto.jpg
         */
        return str1 + str2 + file_name_without_ext + '.' + file_extension
    }

    generateUserFilesName = file_name => {
        /**
         * accept the name of the file
         * create a new file name and change the file name
         * with new generated name
         * and then merger the file extension with the file name
         */

        let file_name_array = file_name.split('.')
        const file_name_length = file_name.length

        let file_name_without_ext = ''
        for( let i=0; i < file_name_array.length - 1; i++ ){
            file_name_without_ext += file_name_array[i]
        }
        // if( file_name_without_ext.length > 20 ){
        //     file_name_without_ext = file_name_without_ext.substring(0, 20)
        // }
        const file_extension = file_name.split('.').pop()
        const array_of_chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9', '_']
        
        
        // let str1 = Date.now()
        
        
        let str2 = ''
        for( let i=0; i < 32; i++ ){
            str2 += array_of_chars[Math.ceil(Math.random() * (array_of_chars.length - 1))]
        }

        /**
         * new file name patter will be 
         * timestamp_in_milli_seconds + random_4_character_string + first_20_chars_of_file_name + extension
         * ex: 1613233184383AbcdMyPhoto.jpg
         */
        return str2 + '.' + file_extension
    }

    generateAlbumUrl = () => {
        const array_of_chars = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','-','_']
        let url = ''
        for( let i=0; i < 128; i++ ){
            url += array_of_chars[Math.ceil(Math.random() * (array_of_chars.length - 1))]
        }
        return url
    }

    deleteFile = async file_path => {
        fs.stat(file_path, ( err, stats ) => {
            if( !err ){
                fs.unlink( file_path, ( err ) => {
                    if( !err ){
                        return true
                    }
                    else{
                        return false
                    }
                })
            }
            else{
                return false
            }
        })
    }
}

module.exports = Global