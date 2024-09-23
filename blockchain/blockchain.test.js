const Blockchain = require('./blockchain');
const Block = require('./block')

describe ('Blockchain', () => {

    let blockchain, blockchain2;

    beforeEach(() => {
        blockchain = new Blockchain()
        blockchain2 = new Blockchain()
    })

    it('will check if the genesis block is the first block in chain', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis())
    });

    it('will create new block', () => {
        const data = 'cats are awesome!'
        blockchain.addBlock(data)
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(data)
    });

    it('will validates correct chain', () => {
        blockchain2.addBlock('cats are awesome!')
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(true)
    });

    it('will invalidates a chain with a corrupt genesis block', () => {
        // should console log: invalid genesis block in isValidChain
        blockchain2.chain[0] = 'Wrong Genesis Block'
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(false)
    });

    it('will validates a corrupt chain', () => {
        blockchain2.addBlock('cats are awesome!')
        blockchain2.chain[1].data = 'cats are not cool!'
        expect(blockchain.isValidChain(blockchain2.chain)).toBe(false)
    });

    it('will replaces chian if new chain is valid', () => {
        blockchain2.addBlock('lazy fat cat')
        blockchain.replaceChain(blockchain2.chain)
        expect(blockchain.chain).toEqual(blockchain2.chain)
    });

    it('will skip chian replacement', () => {
        blockchain.addBlock('kitty')
        blockchain.replaceChain(blockchain2.chain)
        expect(blockchain.chain).not.toEqual(blockchain2.chain)
    });

});