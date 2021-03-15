const express = require('express')

const router = express.Router()

const theme_list = [
    {
        albumid: '123451',
        title: 'Album 1',
        privacy: 'onlyme',
        creation_date: '20200206',
        creation_time: '231517',
        css_color_class: 'aflr_red'
    },
    {
        albumid: '123452',
        title: 'Album 2',
        privacy: 'public',
        creation_date: '20200206',
        creation_time: '231517',
        css_color_class: 'bgms_gray'
    },
    {
        albumid: '123453',
        title: 'Album 3',
        privacy: 'specific',
        creation_date: '20200206',
        creation_time: '231517',
        css_color_class: 'diou_blue'
    },
    {
        albumid: '123454',
        title: 'Album 4',
        privacy: 'unlisted',
        creation_date: '20200206',
        creation_time: '231517',
        css_color_class: 'glrx_yellow'
    }
]



router.get('/:auth_key', ( req, res, next ) => {
    
    res.json({'list': all_albums})
})


/*
using filter to filter the output.
value for filter can be onlyme, public, unlisted, 

*/
router.get('/:filter/:auth_key', ( req, res, next ) => {
    
    res.json({'list': all_albums})
})






module.exports = router