const Block = require('./block');
const { DIFICULTY } = require('../config')

describe ('Block', () => {

    let data, lastBlock, block;

    beforeEach(() => {
        data = 'test_data'
        lastBlock = Block.genesis()
        block = Block.mineBlock(lastBlock, data)
    })

    it('will sets data to match the input', () => {
        expect(block.data).toEqual(data)
    })

    it('will set last hash to match the hash of the last block', () => {
        expect(block.lastHash).toEqual(lastBlock.hash)
    })

    it('creates hash which matches the difficulty', () => {
        expect(block.hash.substring(0, block.dificulty)).toEqual('0'.repeat(block.dificulty))
    })

    it('wil lower difficulty for slowly mined blocks', () => {
        expect(Block.adjustDificulty(block, block.timestamp+360000))
        .toEqual(block.dificulty -1)
    })
});