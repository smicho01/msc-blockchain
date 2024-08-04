const {log} = require("../utils/colours");

/**
 *  Transaction data stored in blockchain.
 *  Does not refer to sending tokens, but it can be any type
 *  of transaction stored as base64 encoded json object.
 *  Client can send a base64 string that represents
 *  any type of object encoded to json.
 */
class TransactionData {
    constructor(dataAsBase64String = '') {
        if(dataAsBase64String) {
            this.base64DataSring = dataAsBase64String
        } else {
            this.base64DataSring = '';
            log('Not a base64 string')
        }
    }

    isBase64String(testedString) {
        const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        return base64Regex.test(testedString);
    }
}


module.exports = TransactionData;