const { INITIAl_BALANCE } = require('../config')
const ChainUtils = require('../utils/chain-util');
const { log, LogsColours } = require('../utils/colours');
const Transaction = require('./transaction');

class Wallet {

    constructor(publicKeyString = null, privateKeyString = null) {
        this.balance = INITIAl_BALANCE
        if (publicKeyString === null && privateKeyString === null) {
            this.keyPair = ChainUtils.genKeyPair(); // genetate pair of keys as this is a new wallet
        } else {
            // case when user has wallet and wallet must be created from KeyPair
            console.log('Recreating wallet from stored keys')
            this.keyPair = ChainUtils.createKeyPairFromStringKeys(publicKeyString, privateKeyString)
            // TODO: if wallet exists , set the wallet balance by scanning all blockchain transactions
        }
        this.publicKey = this.keyPair.getPublic().encode('hex'); // get the public kye but as hex   
    }

    setBalance(newBalance) {
        this.balance = newBalance
    }

    getPrivateKeyAsHexString() {
        return this.keyPair.getPrivate('hex')
    }

    getPublicKeyAsHexString() {
        return this.publicKey;
    }

    toString() {
        return `Wallet - 
            publicKey      : ${this.publicKey.toString()}
            balance        : ${this.balance}`
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash)
    }

    createTransaction(recipient, amount, blockchain, transactionPool, data, sender = null) {
        // BELOW CLODE WAS USED TO ADD TRANSACTIONS TO POOL, but it was conflict when
        // different nodes wanted to add its transaction to the same, not mined pool
        //
        // check if sender transaction exists in the pool already
        // let transaction = transactionPool.existingTransaction(this.publicKey)
        // if (transaction) {
        //     transaction.update(this, recipient, amount)
        // } else {
        //     transaction = Transaction.newTransaction(this, recipient, amount)
        //     transactionPool.updateOrAddTransaction(transaction)
        // }

        let transaction = null

        if (sender !== null) {
            sender.balance = Wallet.getBalance(blockchain, sender.publicKey)
            const senderWalletBalance = sender.balance
            if (amount > senderWalletBalance) {
                log(`Amount: ${amount} is too high for current wallet balance: ${senderWalletBalance}`)
                return 'insufficient funds'
            }

            transaction = transactionPool.existingTransaction(sender.publicKey)
            if (transaction) {
                transaction.update(sender, recipient, amount, data) // TODO : add data element
                if (!Transaction.verifyTransaction(transaction)) {
                    log(`NOT VERIFIED: ${transaction.id}`, LogsColours.BgRed)
                    return 'not verified'
                }
            } else {
                transaction = Transaction.newTransaction(sender, recipient, amount, data) // TODO: add data element
                if (!Transaction.verifyTransaction(transaction)) {
                    log(`NOT VERIFIED: ${transaction.id} `, LogsColours.BgRed)
                    return 'not verified'
                }
                transactionPool.updateOrAddTransaction(transaction)
            }
        } else {
            this.balance = this.claculateBalance(blockchain, this.publicKey)

            if (amount > this.balance) {
                log(`Amount: ${amount} is too high for current wallet balance: ${this.balance}`)
                return 'insufficient funds'
            }
            // Each block will have jsut 1 transaction.
            transaction = Transaction.newTransaction(this, recipient, amount, data)
            if (!Transaction.verifyTransaction(transaction)) {
                log(`NOT VERIFIED: ${transaction.id}`, LogsColours.BgRed)
                return 'not verified'
            }
            transactionPool.updateOrAddTransaction(transaction)
        }

        return transaction
    }

    // Calculate balance for the Node wallet only
    claculateBalance(blockchain) {
        let balance = this.balance
        let transactions = []
        blockchain.chain.forEach(block => block.data.forEach(transaction => {
            transactions.push(transaction)
        }))

        const walletInputTransactions =
            transactions.filter(transaction => transaction.input.address === this.publicKey)

        let startTime = 0

        if (walletInputTransactions.length > 0) {
            const recentInputTransactions = walletInputTransactions.reduce(
                (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
            )
            balance = recentInputTransactions.output.find(output => output.address === this.publicKey).amount
            startTime = recentInputTransactions.input.timestamp
        }

        transactions.forEach(transaction => {
            if (transaction.input.timestamp > startTime) {
                transaction.output.find(output => {
                    if (output.address === this.publicKey) {
                        balance += output.amount
                    }
                })
            }
        })

        return balance
    }

    static getBalance(blockchain, walletAddress) {
        console.log("getBalance for wallet " + walletAddress)
        const transactions = this.getWalletTransactions(blockchain, walletAddress)
        let balance = 0;
        transactions.forEach(t => {
            if(t.type === 'OUTPUT') {
                balance += t.amount
            } else if (t.type === 'INPUT') {
                balance -= t.amount
            }
        });

        return balance
    }

    static getWalletTransactions(blockchain, walletAddress) {
        console.log('Getting wallet transactions ...')
        let transactions = []
        blockchain.chain.forEach(block => block.data.forEach(t => {
            if(t.input.address === walletAddress) {
                // Input transaction [balance extraction]
                console.log("GOT INPUT !", t.id, " amount: ", t.output[1].amount)
                transactions.push({id: t.id, amount: t.output[1].amount , type: 'INPUT' })
            }

            if(t.output.length > 1){
                if(t.output[1].address === walletAddress) {
                    // Output transaction [balance addition]
                    console.log("GOT OUTPUT !", t.id, " amount: ", t.output[1].amount)
                    transactions.push({id: t.id, amount: t.output[1].amount , type: 'OUTPUT' })
                }
            }

        }))

        return transactions
    }

    static blockchainWallet() {
        const blockchainWallet = new this()
        return blockchainWallet
    }

}
module.exports = Wallet