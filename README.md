# Sev Blockchain
Demo blockchain in JS

## Run nodes locally

#### With Seed Servers running

Each node will connect with randomly selected Seed Server (check `config.js` SEED_SERVERS). Seed server will broadcast
node registration to all other known seed servers. All known seed servers should have node in their register. 

local node 1 `PROFILE=dev npm run dev`

local node 2 `PROFILE=dev HTTP_PORT=3002 P2P_PORT=5002 npm run dev`

local node 3 `PROFILE=dev HTTP_PORT=3003 P2P_PORT=5003 npm run dev`

#### Without Seed Servers

Below commands include list of Peers as param. This should be removed when Seed Nodes are introduced.

local node 1 `PROFILE=dev npm run dev`

local node 2 `PROFILE=dev HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev`

local node 3 `PROFILE=dev HTTP_PORT=3003 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev`

Connect to remote nodes `PEERS=ws://13.40.42.210:5001,ws://13.40.4.5:5001 npm run dev`

## Registering with Seed Servers

Each Sev Blockchain (SBC) nodes need to know about other nodes in network as BC is a distributed ledger. For that reason there are Seed Servers.
They allow all nodes to register with them. Thanks to that, nodes doesn't need to know about other active nodes when starting, but can get the list of
available SBC nodes from seed servers. Seed Servers should update list of active nodes by sending 'heartbeat check' call to registered nodes. List should be updated on regular basis. 

## Parameters 

PROFILE - selected profile. example PROFILE=dev , PROFILE=prod, PROFILE=test

HTTP_PORT - application port, default 3001

PEERS - coma delimited string with websocket addresses of SBC nodes