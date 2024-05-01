// P2P Server
const Websocket = require('ws')
const { P2P_PORT, PEERS_REGISTRY } = require('../config')
const { log } = require('../utils/colours')
const PeersRegistry = require('./PeersRegistry')

const peers = process.env.PEERS ? process.env.PEERS.split(',') : PEERS_REGISTRY.getPeers()

const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clearTransactions: 'CLEAR_TRANSACTIONS'
}

class P2PServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain
        this.transactionPool = transactionPool
        this.sockets = []
    }

    listen() {
        const server = new Websocket.Server({
            port: P2P_PORT
        })
        server.on('connection', socket => this.connectSocket(socket))

        this.connectToPeers();

        log(`Listening for p2p connection on: ${P2P_PORT}`)
    }

    connectSocket(socket) {
        this.sockets.push(socket)
        console.log('Socket Connected')
        this.messageHandler(socket)
        this.sendChain(socket)
    }

    connectToPeers() {
        peers.forEach(peer => {
            const socket = new Websocket(peer)
            socket.on('open', () => this.connectSocket(socket))
        })
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message)
            switch (data.type) {
                case MESSAGE_TYPES.chain:
                    console.log(`Received broadcasted message: sync chain`)
                    this.blockchain.replaceChain(data.chain)
                    break;
                case MESSAGE_TYPES.transaction:
                    console.log(`Received broadcasted message: sync pool transactions`)
                    this.transactionPool.updateOrAddTransaction(data.transaction)
                    break;
                case MESSAGE_TYPES.clearTransactions:
                    console.log(`Received broadcasted message: clear transaction pool`)
                    this.transactionPool.clear();
                    break;
            }

        })
    }

    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }))
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction: transaction
        }))
    }

    syncChains() {
        console.log(`Broadcasting sync chain to all nodes.`)
        this.sockets.forEach(socket => {
            this.sendChain(socket)
        })
    }

    clearPoolTransactions(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clearTransactions
        }))
    }


    broadcastTransaction(transaction) {
        console.log(`Broadcasting transaction to all nodes.`)
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction)
        })
    }

    broadcastClearPoolTransactions() {
        console.log(`Broadcasting transaction pool clear to all nodes`)
        this.sockets.forEach(socket => {
            this.clearPoolTransactions(socket)
        })
    }
}
module.exports = P2PServer