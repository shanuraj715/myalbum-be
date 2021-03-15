

class HttpError extends Error{
    constructor(message, code){
        super(message) // Add a message property
        this.code = code // adds a code property
    }
}

module.exports = HttpError