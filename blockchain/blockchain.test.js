const Blockchain = require('./blockchain');
const Block = require('./block')

describe ('Blockchain', () => {

    let blockchain, blockchain2;

    beforeEach(() => {
        blockchain = new Blockchain()
        blockchain2 = new Blockchain()
    })

    it('start with the genesis block as 1st block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis())
    });

    it('adds new block', () => {
        const data = 'cats are awesome!'
        blockchain.addBlock(data)

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(data)
    });

    it('validates a valid chain', () => {
        blockchain2.addBlock('cats are awesome!')
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(true)
    });

    it('invalidates a chain with a corrupt genesis block', () => {
        // shoul console log: invalid genesis block in isValidChain
        blockchain2.chain[0] = 'Bad Genesis Block'
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(false)
    });

    it('validates a corrupt chain', () => {
        blockchain2.addBlock('cats are awesome!')
        blockchain2.chain[1].data = 'cats are not cool!'
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(false)
    });


    it('replaces chian if new chain is valid', () => {
        blockchain2.addBlock('lazy snake')
        
        blockchain.replaceChain(blockchain2.chain)
        // should also console log: Replacing blockchain with the new chain!
        expect(blockchain.chain).toEqual(blockchain2.chain)
    });

    it('does not replaces chian with invalid new chain length [<=]', () => {
        blockchain.addBlock('foo')
        blockchain.replaceChain(blockchain2.chain)
        // should also console log: Received chain is not longer than the current chain [consenus matter]
        expect(blockchain.chain).not.toEqual(blockchain2.chain)
    });

});