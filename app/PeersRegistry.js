var ip = require("ip");
const { log, LogsColours } = require("../utils/colours")
const APP_IP = ip.address()
const P2P_PORT = process.env.P2P_PORT || 5001

const CURRENT_WEBSOCKET =  process.env.WEBSOCKET_ADDRESS || `ws://${APP_IP}:${P2P_PORT}` // CURRENT PEER

class PeersRegistry {

    constructor() {
        this.peers = process.env.PEERS ? process.env.PEERS.split(',') : []
        log(`Peers registry created`, LogsColours.BgBlue)
        log(`Peers count (${this.peers.length}): ${this.peers}`)
    }

    addPeer(peer) {
        if (peer !== CURRENT_WEBSOCKET) {
            APP_IP
            if (!this.findPeer(peer)) {
                this.peers.push(peer)
                log(`Peer ${peer} added to register`, LogsColours.BgGreen)
                return this.peers
            }
            //log(`Peer ${peer} already registered`, LogsColours.FgYellow)
        }
        return this.peers
    }

    addPeersAsList(peersList) {
        peersList.forEach(peer => {
            this.addPeer(peer)
        })
        return this.peers
    }

    removePeer(peer) {
        return this.peers = this.peers.filter(p => p !== peer)
    }

    getPeers() {
        return this.peers
    }

    findPeer(peer) {
        return this.peers.find(p => p === peer)
    }

}

module.exports = PeersRegistry