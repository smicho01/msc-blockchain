const EC = require('elliptic').ec
const {v4: uuidv4} = require('uuid')
const SHA256 = require ('crypto-js/sha256')

const ec = new EC('secp256k1')

class ChainUtils {

    static createKeyPairFromStringKeys(publicKeyAsHexString, privateKeyAsHexString) {
        let keyPairFromPublicKey = ec.keyFromPublic(publicKeyAsHexString, 'hex');
        keyPairFromPublicKey.priv = ec.keyFromPrivate(privateKeyAsHexString).getPrivate() // keyPairFromPublicKey nie ma klucza private, trzeba mu je wstrzyknac
        
        return keyPairFromPublicKey
    }

    static testIfPossibleToSavePublicKeyAndRecreateKeyPairOutOfIt() {
        
        const kp = ec.genKeyPair() // create key pair
        const pr =  kp.getPrivate('hex') // derive private key
        const pu = kp.getPublic() // derive public key

        //const prStr = JSON.stringify(pr) // stringify privatye key to store in DB
        console.log('private key as hex string: ', pr)
        console.log('public key as string: ' ,'ss')
        const puStr = pu.encode('hex') // create hex string of public key

        let keyPairFromPublicKey = ec.keyFromPublic(puStr, 'hex');
        keyPairFromPublicKey.priv = ec.keyFromPrivate(pr).getPrivate(); // keyPairFromPublicKey nie ma klucza private, trzeba mu je wstrzyknąć

        if(JSON.stringify(keyPairFromPublicKey) === JSON.stringify(kp)) {
            console.log('Original KeyPair and Derived KeyPair are the same  !!!!!')
        }

        const kp2 = keyPairFromPublicKey;

        console.log('==============================================')
        console.log(kp2.getPublic().encode('hex'))
        console.log('==============================================')
        console.log(kp.getPublic().encode('hex'))

        console.log('==============================================')
        console.log(kp2.getPrivate('hex'))
        console.log('==============================================')
        console.log(kp.getPrivate('hex'))

    }
    
    static genKeyPair () {
        //ChainUtils.testIfPossibleToSavePublicKeyAndRecreateKeyPairOutOfIt()
        //ChainUtils.createKeyPairFromStringKeys('04c3b6b1dffcfb43f84aea3efae5b2fb55aa8fd63e60ee6a8ae82c04db7259c339f6735efe5b764b9b06dcd76b219a9efcfacf5d3e3f9af37309d30611cc8b5001', '"e4d3ef983a3ec2090572b87c916f83dde22c332db8c66cd46ef9f4008e31cf1d"')
        return ec.genKeyPair();
    }

    static id() {
        return uuidv4()
    }

    static hash(data) {
        return SHA256(JSON.stringify(data)).toString()
    }

    static verifySignature(publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature)
    }

}

module.exports = ChainUtils