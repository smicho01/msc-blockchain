const ChainUtils = require('../utils/chain-util')
const { MINING_REWARD } = require('../config')
const { log, LogsColours } = require('../utils/colours')

class Transaction {

    constructor(){
        this.id = ChainUtils.id()
        this.input = null
        this.output = []
    }

    update(senderWallet, recipient, amount) {
        const senderOutput = this.output.find(output => output.address === senderWallet.publicKey)

        // Check case if sender want to send some amount in short time after previous transaction
        // and may not have enough balance (preventing double spend problem)
        if(amount > senderOutput.amount) {
            console.log(`Amout: ${amount} is higher than balance!`)
            return;
        }

        senderOutput.amount = senderOutput.amount - amount
        this.output.push({amount, address: recipient})
        // Need to sign transaction again if new item was added to outputs
        Transaction.signTransaction(this, senderWallet)

        return this
    }

    static transactionWithOutputs(senderWallet, outputs) {
        const transaction = new this()
        transaction.output.push(...outputs)
        Transaction.signTransaction(transaction, senderWallet)
        return transaction
    }

    static newTransaction(senderWallet, recipient, amount) {
        if(amount > senderWallet.balance) {
            console.log(`Amount: ${amount} bigger than a wallet balance!`)
            return
        }
        return Transaction.transactionWithOutputs(senderWallet,[
            { amount: senderWallet.balance - amount, address: senderWallet.publicKey },
            { amount, address: recipient}
        ])
    }
    static rewardTransaction(minerWallet, blockchainWallet ) {
        // function will sign reward transaction for miners. Miner can't sign own reward transaction
        return Transaction.transactionWithOutputs(blockchainWallet, [{
            amount: MINING_REWARD,
            address: minerWallet.publicKey
        }] )
    }

    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtils.hash(transaction.output))
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtils.verifySignature(
            transaction.input.address, 
            transaction.input.signature,
            ChainUtils.hash(transaction.output)
        )
    }
}

module.exports = Transaction