const ChainUtils = require("../utils/chain-util")
const { DIFICULTY, MINE_RATE, PROFILE } = require('../config')

class Block {
    
    constructor(timestamp, lastHash, hash, data, nonce, dificulty, blockNumberInChain) {
        this.timestamp = timestamp
        this.lastHash = lastHash
        this.hash = hash
        this.data = data
        this.nonce = nonce;
        this.dificulty = dificulty || DIFICULTY

        this.blockNumberInChain = blockNumberInChain || 1
    }

    static genesis() {
        return new this('Big Bang', 
        '------', 
        '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9', // "0" in SHA256 , but can be anything here
        [],
        0,  // nonce
        DIFICULTY)
    }

    static mineBlock(lastBlock, data) {
        let hash, timestamp;
        const lastHash = lastBlock.hash

        // calculate new difiuculty
        let { dificulty } = lastBlock;
        
        // Proof of Work part
        console.log(`Searching for valid nonce ...  `)
        let nonce = 0
        do {
            nonce++ // noce is changing to generate new hash with DIFICILTY number of leading Zeros
            timestamp = Date.now()
            dificulty = Block.adjustDificulty(lastBlock, timestamp) // need timestamp to calculate how long it takes to find nonce
            hash = Block.hash(timestamp, lastHash, data, nonce, dificulty)
        } while(hash.substring(0, dificulty) !== '0'.repeat(dificulty)) // loop untill hash has DIFICILTY num. of leading '0' in hash
        console.log(`Found block nonce: ${nonce}`)

        let thisBlockNumberInChain = lastBlock.blockNumberInChain + 1
    
        return new this(timestamp, lastHash, hash, data, nonce, dificulty,thisBlockNumberInChain)
    }

    static hash(timestamp, lastHash, data, nonce, dificulty) {
        return ChainUtils.hash(`${timestamp}${lastHash}${data}${nonce}${dificulty}`).toString()
    }

    static blockHash(block) {
        const { timestamp, lastHash, data, nonce, dificulty } = block;
        return Block.hash(timestamp, lastHash, data, nonce, dificulty)
    }

    toString() {
        return `Block - 
            Timestamp   : ${this.timestamp}
            Last Hash   : ${this.lastHash.substring(0, 20)}
            Hash        : ${this.hash.substring(0, 20)} 
            Nonce       : ${this.nonce} 
            Dificulty   : ${this.dificulty}
            Data:       : ${this.data}
        `
    }
    static adjustDificulty(lastBlock, currentTime) {
        let { dificulty } = lastBlock
        dificulty = lastBlock.timestamp + MINE_RATE > currentTime ? dificulty + 1 : dificulty - 1
        
        return PROFILE === 'dev' ? 1 :  dificulty
    }
}

module.exports = Block;