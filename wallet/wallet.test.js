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

    // describe('creating transaction', () => {
    //     let transaction, sendAmount, recipient;

    //     beforeEach(() => {
    //         sendAmount = 20;
    //         recipient = 'rEc1piEnt-aDDress'
    //         transaction = wallet.createTransaction(recipient, sendAmount, blockchain, tp)
    //     })

    //     describe('attempting the same transaction', () => {
    //         beforeEach(() => {
    //             wallet.createTransaction(recipient, sendAmount, blockchain, tp)
    //         })

    //         it('double the `sendAmount` subtracted from the wallet balance', () => {
    //             expect(transaction.output.find(output => output.address === wallet.publicKey).amount)
    //                 .toEqual(wallet.balance - sendAmount * 2)
    //         })

    //         it('clones the `sendAmount` output for the recpient', () => {
    //             expect(transaction.output.filter(output => output.address === recipient)
    //                 .map(output => output.amount)).toEqual([sendAmount, sendAmount])
    //         })
    //     })
    // })

    describe('calculating wallet balance', () => {
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

        it('calculates balance for the recipient', () => {
            expect(wallet.claculateBalance(blockchain))
                .toEqual(INITIAl_BALANCE + (addBalance * repeatAdd))
        })

        it('calculates balance for the sender', () => {
            expect(senderWallet.claculateBalance(blockchain))
                .toEqual(INITIAl_BALANCE - (addBalance * repeatAdd))
        })


        describe('the recipien conducts the transaction', () => {
            let subtractBalance, recipientBalance

            beforeEach(() => {
                tp.clear()
                subtractBalance = 60
                recipientBalance = wallet.claculateBalance(blockchain)
                wallet.createTransaction(senderWallet.publicKey, subtractBalance, blockchain, tp)
                blockchain.addBlock(tp.transactions)
            })

            describe('when the sender send transaction to recipent', () => {
                beforeEach(() => {
                    tp.clear()
                    senderWallet.createTransaction(wallet.publicKey, addBalance, blockchain, tp)
                    blockchain.addBlock(tp.transactions)
                })

                it('calcualtes recipient balance using only transaction since the last one transaction', () => {
                    expect(wallet.claculateBalance(blockchain))
                        .toEqual(recipientBalance - subtractBalance + addBalance)
                })
            })

        })
    })

})