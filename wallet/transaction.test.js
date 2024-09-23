const { MINING_REWARD } = require('../config')
const Transaction = require('./transaction')
const Wallet = require('./wallet')

describe ('Transaction', () => {

    let transaction, wallet, recipient, amount
    
    beforeEach(() => {
        wallet = new Wallet('04abaebdfa39bcd76a3cecbee7aea5f83eaaf62f57c32f886b3fbaf766ba931087e7b9fa6478d344d0083e7f3a66691127c933d0bd9f2bd7a50ac3be9c101045fd', 'c569cdf9fe09c8f41983071e735987e86d03040727e440b5396d8c44613c2ee5')
        amount = 10
        recipient = '0xRecipient1'
        transaction = Transaction.newTransaction(wallet, recipient, amount)
    })

    it('check if wallet has correct outputs', () => {
        expect(transaction.output.find( otpt => otpt.address === wallet.publicKey).amount)
            .toEqual(wallet.balance - amount)
    })

    it('check amount added to recipient balance', () => {
        expect(transaction.output.find( otpt => otpt.address === recipient).amount)
            .toEqual(amount)
    })

    it('will check if transaction and wallet have valid balances/ouputs', () => {
        expect(transaction.input.amount).toEqual(wallet.balance)
    })

    it('checks if transaction is valid', () => {
        expect(Transaction.verifyTransaction(transaction)).toBe(true)
    })

    it('checks for invalid transaqction', () => {
        transaction.output[0].amount = 150000
        expect(Transaction.verifyTransaction(transaction)).toBe(false)
    })


    describe('Test transaction with input amount higher than wallet balance', () => {
        
        beforeEach(() => {
            amount = 500000000000
            transaction = Transaction.newTransaction(wallet, recipient, amount)
        })

        it('reject transaction if input amount is higher than wallet balance`', () => {
            expect(transaction).toEqual(undefined)
        })
    })


    describe('Test transaction updates', () => {

        let nextAmount, nextRecipient;

        beforeEach(() => {
            nextAmount = 20;
            nextRecipient = '2feceb16ffc86f38d952786c6d696c723a' // some random address
            transaction = transaction.update(wallet, nextRecipient, nextAmount)
        })

        it('will subtract the amount from the sender outputs', () => {
            expect(transaction.output.find(output=> output.address === wallet.publicKey).amount)
             .toEqual(wallet.balance - amount - nextAmount)
                
        })

        it('correctly changed', () => {
            expect(transaction.output.find(output => output.address === nextRecipient).amount)
              .toEqual(nextAmount)
        })
    })


    describe('Test create and reward the new transactions', () => {

        beforeEach(() => {
            transaction  = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet())
        })

        it('will reward the miner wallet', () => {
            expect(transaction.output.find(output => output.address === wallet.publicKey).amount)
                .toEqual(MINING_REWARD)
        })

    })
})