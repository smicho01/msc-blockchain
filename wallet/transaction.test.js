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

    it('outputs the `amount` from the wallet balance', () => {
        expect(transaction.output.find( otpt => otpt.address === wallet.publicKey).amount)
            .toEqual(wallet.balance - amount)
    })

    it('outputs the `amount` added to the recipient balance', () => {
        expect(transaction.output.find( otpt => otpt.address === recipient).amount)
            .toEqual(amount)
    })

    it('inputs the balance of the wallet', () => {
        expect(transaction.input.amount).toEqual(wallet.balance)
    })

    it('validates the valid transaction', () => {
        expect(Transaction.verifyTransaction(transaction)).toBe(true)
    })

    it('validates an invalid transaction', () => {
        transaction.output[0].amount = 150000
        expect(Transaction.verifyTransaction(transaction)).toBe(false)
    })


    describe('transaction with amount higher than wallet balance', () => {
        
        beforeEach(() => {
            amount = 50000000000
            transaction = Transaction.newTransaction(wallet, recipient, amount)
        })

        it('doesnt creates transaction when `amount` higher than `balance`', () => {
            expect(transaction).toEqual(undefined)
        })
    })


    describe('updating transaction', () => {

        let nextAmount, nextRecipient;

        beforeEach(() => {
            nextAmount = 20;
            nextRecipient = '2feceb16ffc86f38d952786c6d696c723a' // random address
            transaction = transaction.update(wallet, nextRecipient, nextAmount)
        })

        it('subtracts the next amount from sender aoutput', () => {
            expect(transaction.output.find(output=> output.address === wallet.publicKey).amount)
             .toEqual(wallet.balance - amount - nextAmount)
                
        })

        it('amount of recipient was changed correctly', () => {
            expect(transaction.output.find(output => output.address === nextRecipient).amount)
              .toEqual(nextAmount)
        })
    })


    describe('create and reward transactions', () => {

        beforeEach(() => {
            transaction  = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet())
        })

        it('reward the miners wallet', () => {
            expect(transaction.output.find(output => output.address === wallet.publicKey).amount)
                .toEqual(MINING_REWARD)
        })

    })
})