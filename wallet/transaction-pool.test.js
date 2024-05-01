const TractionPool = require('./transaction-pool')
const Transaction = require('./transaction')
const Wallet = require('./wallet')
const Blockchain = require('../blockchain/blockchain')


describe('Transaction Pool', () => {
    let tp, wallet, transaction, blockchain;
    
    beforeEach(() => {
        tp = new TractionPool()
        wallet = new Wallet();
        blockchain = new Blockchain()
        transaction = wallet.createTransaction('1deaef34ad76a', 30, blockchain, tp)
        
    })

    it('validates if transaction was added to the pool', () => {
        expect(tp.transactions.find( t => t.id === transaction.id))
            .toEqual(transaction)
    })

    it('validates if transaction was updated in the pool', () => {
        let oldTransaction = JSON.stringify(transaction)
        const newTransaction = transaction.update(wallet, 'nEw12tRansaCt1on2', 40)
        tp.updateOrAddTransaction(newTransaction)

        expect(JSON.stringify(tp.transactions.find( t => t.id === newTransaction.id)))
          .not.toEqual(oldTransaction)
    })

    it('clears transactions pool', () => {
        tp.clear()
        expect(tp.transactions).toEqual([])
    })


    describe('mixing valid and corruted transactions', () => {
        let validTransactions;

        beforeEach(() => {
            validTransactions = [...tp.transactions] // ... as we have already 1 transaction in the pool (see above)
            // Loop will create 1/2 valid and 1/2 invalid transactions
            for(let i=0; i<6; i++) {
                wallet = new Wallet()
                transaction = wallet.createTransaction('randomAddreSS2', 30, blockchain, tp)
                if( i % 2 == 0 ) {
                    // corrupt the transaction manually
                    transaction.input.amount = 999999;
                } else {
                    validTransactions.push(transaction)
                }
            }
        })

        it('shows the difference between valid an corrupted transactions', () => {
            expect(JSON.stringify(tp.transaction)).not.toEqual(JSON.stringify(validTransactions))
            expect(tp.transactions.length).toEqual(7)
            expect(validTransactions.length).toEqual(4) // 3 from loop + 1 (above)
        })

        it('takes valid transactions', () => {
            expect(tp.validTransactions()).toEqual(validTransactions)
        })

    })
})