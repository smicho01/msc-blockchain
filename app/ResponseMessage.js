class ResponseMessage {
    
    constructor(message, code = null, data = null) {
        this.message = message
        this.code = code == null ? 400 : code
        this.data = data == null ? data : null
    }

    setMessage(message) {
        this.message = message
    }

    setCode(code) {
        this.code = code
    }

    setData(data) {
        this.data = data
    }

    static get() {
        return {
            code: this.code,
            message: this.message,
            data: this.data
        }
    }
}

module.exports = ResponseMessage