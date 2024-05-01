const Transaction = require('./transaction')

class TractionPool {
    
    constructor() {
        this.transactions = []
        this.poolCreationTime = Date.now()
    }

    updateOrAddTransaction(transaction) {
        // Check if pool has zero transactions and rset its poolCreationTime to now 
        // It is used to mone block if there is too low num of transactions to mie byt block is quite old
        // Prevent from waiting 'forever' to mine latest transactions
        if(this.transactions.length == 0) {
            console.log(`Adding first transaction to the pool. Reseting poolCreationTime to current timestamp`)
            this.poolCreationTime = Date.now()
        }
        // Transaction may exisst in transactions table, so it need an update as transaction can have multiple outputs
        let findExistingTransaction = this.transactions.find(trans => trans.id === transaction.id)
        if(findExistingTransaction)  {
            this.transactions[this.transactions.indexOf(findExistingTransaction)] = transaction
        } else {
            this.transactions.push(transaction)
        }
    }

    existingTransaction(walletAddress) {
        return this.transactions.find(t => t.input.address === walletAddress)
    }

    validTransactions() {
        return this.transactions.filter(transaction => {
            // check if total amount of transactions in output matches the input amount (dlb spending prevention)
            const outputTotal = transaction.output.reduce((total, output) => {
                return total + output.amount;
            }, 0)

            if(transaction.input.amount !== outputTotal) {
                console.log(`Invalid transaction from ${transaction.input.address} in transaction pool! Invalid input-output amounts.`)
                return 
            }

            if(!Transaction.verifyTransaction(transaction)) {
                console.log(`Invalid signature from ${transaction.input.address}`)
                return 
            }

            return transaction

        })
    }

    clear() {
        this.transactions = []
    }
}
module.exports = TractionPool