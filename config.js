var ip = require("ip");
const PeersRegistry = require("./app/PeersRegistry");

const DIFICULTY = 4
const MINE_RATE = 3000 // 3 seconds in miliseconds
const INITIAl_BALANCE = 100 // Node/Blockchain starting balance

const MINING_REWARD = 10
const MIN_NUM_TRANSACTIONS_TO_MINE = 5

const HTTP_PORT = process.env.HTTP_PORT || 3001
const PROFILE = process.env.PROFILE || 'prod'
const APP_IP = ip.address()
const P2P_PORT = process.env.P2P_PORT || 5001

const CURRENT_SERVER =   process.env.SERVER_IP || `http://${APP_IP}:${HTTP_PORT}`
const CURRENT_WEBSOCKET =  process.env.WEBSOCKET_ADDRESS || `ws://${APP_IP}:${P2P_PORT}` // CURRENT PEER

const PEERS_REGISTRY = new PeersRegistry() // GLOBAL PEER REGISTRY

// Seed servers for selected profiles
let SEED_SERVERS = {
    "dev": [
        'http://localhost:3030',
        'http://localhost:3040'
    ],
    "prod": [
        `http://13.40.42.210:3030`,
        'http://13.40.4.5:3030'
    ]
}

module.exports = { 
    DIFICULTY, MINE_RATE, INITIAl_BALANCE, MINING_REWARD, 
    MIN_NUM_TRANSACTIONS_TO_MINE, SEED_SERVERS, 
    CURRENT_SERVER, CURRENT_WEBSOCKET, HTTP_PORT,
    P2P_PORT, PROFILE, PEERS_REGISTRY
}