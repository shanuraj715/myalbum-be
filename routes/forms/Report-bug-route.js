const express = require('express')
const mongoose = require('mongoose')

const Global = require('../../classes/Global')
const GetIp = require('ipware')().get_ip
require('dotenv').config()
const bodyParser = require('body-parser')
const ReportBugSchema = require('../../schema/Report-Bug')

const global = new Global()
const router = express.Router()

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json())


const vars_for_this_page = {
    max_file_size_to_upload: 5 * 1024 * 1024 // MB * 1024 * 1024 == in bytes
}


const ReportBugModel = new mongoose.model("Report_bug", ReportBugSchema)

router.post('/', async ( req, res, next ) => {
    const { name, email, message, file_name } = req.body.body
    console.log( file_name )
    const file_path = process.env.APP_FILES + new Date().getFullYear() + '_' + (new Date().getMonth() + 1) + '/' + file_name
    const data = {
        name: name,
        email: email,
        message: message,
        userIp: GetIp( req ).clientIp,
        file: [{ filePath: file_path}]
    }

    const result = await ReportBugModel.insertMany( [data])

    if( result.length !== 0 ){
        res.json({
            status: true,
            message: "Data daved. Uploading file."
        })
    }
    else{
        console.log("Unable to save data")
    }
})


router.post('/file', async ( req, res, next ) => {

    const file = req.files.file

    /**
     * check for file size
     */
    if( file.size > vars_for_this_page.max_file_size_to_upload ){
        res.json({
            status: false,
            error: {
                message: "Max " + ((vars_for_this_page.max_file_size_to_upload / 1024) / 1024) + " MB file size allowed."
            }
        })
        return false
    }

    const path_for_file = process.env.APP_FILES + new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/'
    /**
     * check for existing directory
     * if not directory exist
     * then create a new directory
     */
    if( !global.directoryExists( path_for_file )){
        if( global.directoryCreate( path_for_file ) ){
            console.log("Created")
        }
        else{
            console.log("Not created")
        }
    }
    const file_new_name = global.generateAppFilesName( file.name )
    file.mv( path_for_file + file_new_name, err => {
        if( !err ){
            res.json({
                status: true,
                message: "File uploaded successfully.",
                file_name: file_new_name
            })
        }
        else{
            res.json({
                status: false,
                error: {
                    message: "Server Error. Failed to upload"
                }
            })
        }
    } )
    
})






module.exports = router