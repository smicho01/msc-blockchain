const Wallet = require('./wallet')
const Transaction = require('./transaction')
const TransactionPool = require('./transaction-pool')
const Blockchain = require('../blockchain/blockchain')
const { INITIAl_BALANCE } = require('../config')


describe('Wallet', () => {

    let wallet, tp, blockchain;

    beforeEach(() => {
        wallet = new Wallet('04c3b6b1dffcfb43f84aea3efae5b2fb55aa8fd63e60ee6a8ae82c04db7259c339f6735efe5b764b9b06dcd76b219a9efcfacf5d3e3f9af37309d30611cc8b5001', '"e4d3ef983a3ec2090572b87c916f83dde22c332db8c66cd46ef9f4008e31cf1d"')
        tp = new TransactionPool()
        blockchain = new Blockchain()
    })

    describe('Test calculating the wallet balance', () => {
        let addBalance, repeatAdd, senderWallet;

        beforeEach(() => {
            senderWallet = new Wallet();
            addBalance = 10;
            repeatAdd = 1;
            for(let i=0; i<repeatAdd; i++) {
                senderWallet.createTransaction(wallet.publicKey, addBalance, blockchain, tp)
            }
            blockchain.addBlock(tp.transactions)
        })

        it('will calculate the balance for the recipient', () => {
            expect(wallet.claculateBalance(blockchain))
                .toEqual(INITIAl_BALANCE + (addBalance * repeatAdd))
        })

        it('will calculate the balance for the sender', () => {
            expect(senderWallet.claculateBalance(blockchain))
                .toEqual(INITIAl_BALANCE - (addBalance * repeatAdd))
        })
    })

})