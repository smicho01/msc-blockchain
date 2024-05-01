const { log } = require("./colours");
const { CURRENT_WEBSOCKET, PEERS_REGISTRY, PROFILE, SEED_SERVERS } = require("../config");


/**
 * Register with Seed Servers
 */
function registerWithSeedServer() {
    const selectedSeedServer = selectRandomSeedServer()
    log(`SELECTED SEED SERVER IS: ${selectedSeedServer}`)
    if (selectedSeedServer != undefined) {

        fetch(`${selectedSeedServer}/blockchainnode/register?node=${CURRENT_WEBSOCKET}`, {
            method: "POST"
        }).then((response) => response.json())

        // Get all websockets from the Seed Server and register tem in PeerRegsitry
        fetch(`${selectedSeedServer}/seedserver/bcnodes`, {
            method: "GET"
        })
            .then((response) => {
                return response.json()
            })
            .then(res => {
                log(`List of received nodes: ${res}`)
                PEERS_REGISTRY.addPeersAsList(res)
            })

        return;
    }
    console.log("ERROR: Don't have seed servers list for profile: " + PROFILE);
}

function selectRandomSeedServer() {
    return SEED_SERVERS[PROFILE][Math.floor(Math.random() * SEED_SERVERS[PROFILE].length)]
}

function getPeerListFromAllKnownSeedServers() {
    SEED_SERVERS[PROFILE].forEach(seedServer => {
        fetch(`${seedServer}/seedserver/bcnodes`, {
            method: "GET"
        })
        .then((response) => {
            return response.json()
        })
        .then(res => {
            PEERS_REGISTRY.addPeersAsList(res)
        })
        .catch(error => {
            log(`ERROR: ${error}`)
        })
    })
}


module.exports = {
    registerWithSeedServer,
    selectRandomSeedServer,
    getPeerListFromAllKnownSeedServers
}