
const settings = require('../settings.json')
const bcrypt = require('bcrypt')
class LoginRegister{

    sessionKey = async () => {
        const array_of_chars = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','-','_']
        let key = ''
        for( let i=0; i< settings.sessionKeyLength; i++ ){
            key += array_of_chars[Math.ceil(Math.random() * (array_of_chars.length - 1))]
        }
        return key
    } 

    encryptPassword = async ( password ) => {
        const hashedPassword = await bcrypt.hash( password, 10)
        return hashedPassword
    }

    checkPassword = async ( password, userPassword ) => {
        const match = await bcrypt.compare( password, userPassword )
        return match ? true : false
    }

}

module.exports = LoginRegister