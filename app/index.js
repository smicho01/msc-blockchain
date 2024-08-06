const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
require('dotenv/config')
const fetch = require('cross-fetch')

const { INITIAl_BALANCE, SEED_SERVERS, CURRENT_WEBSOCKET,
    PEERS_REGISTRY, PROFILE, HTTP_PORT, CURRENT_SERVER } = require('../config')

const Blockchain = require('../blockchain/blockchain')
const P2PServer = require('./p2p-server')
const PeersRegistry = require('./PeersRegistry')
const Wallet = require('../wallet/wallet')
const TractionPool = require('../wallet/transaction-pool')
const Miner = require('./miner')
const { log, LogsColours } = require('../utils/colours')
const { registerWithSeedServer } = require('../utils/utils')
const { cronejob_get_peers_lists_from_seed_servers } = require('../utils/crone-jobs')
const Transaction = require('../wallet/transaction')
const cors = require('cors');

const app = express()
app.use(bodyParser.json())
app.use(cors());

/* Perform basic inits for the Node */
const blockchain = new Blockchain()
const wallet = new Wallet(process.env.BLOCKCHAIN_WALLET_PUB, process.env.BLOCKCHAIN_WALLET_PRIV) // node wallet
wallet.setBalance(100000000) // node wallet balance; Used to reward users
console.log(`Blockchain wallet balance: ${wallet.balance}`)
const tp = new TractionPool()
const p2pServer = new P2PServer(blockchain, tp);
const miner = new Miner(blockchain, tp, wallet, p2pServer)


/* ============= BLOCKCHAIN ROUTES ============ */

app.get('/blockchain/blocks', (req, res) => {
    console.log('[GET] /blockchain/blocks')
    res.json(blockchain.chain)
})

app.get('/blockchain/transaction/:transactionId', async (req, res) => {
    console.log('[GET] /blockchain/transaction/:transactionId')
    try {
        const transactionId = req.params.transactionId;
        console.log('Transaction id: ' + transactionId)
        const foundTransaction = Blockchain.findTransaction(blockchain, transactionId);
        if (!foundTransaction) {
            throw new Error(`Transaction with id ${transactionId} not found.`);
        }
        res.status(200).send(foundTransaction);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

app.get('/blockchain/transaction/confirmation/:transactionId', async (req, res) => {
    console.log('[GET] /blockchain/transaction/confirmation/:transactionId')
    try {
        const transactionId = req.params.transactionId;
        console.log('Transaction id: ' + transactionId)
        const foundTransactionConfirmations = await Blockchain.getTransactionConfirmations(blockchain, transactionId);
        res.status(200).send({ confirmations: foundTransactionConfirmations });
    } catch(err) {
        // Handle the error appropriately, for example:
        res.status(500).send({ error: err.message });
    }
});

app.post('/blockchain/tofile', (req, res) => {
    console.log('[POST] /blockchain/tofile')
    let fileName = `sevchain-backup-${Date.now()}.json`;
    var fs = require('fs');
    fs.writeFile(`backups/${fileName}`, JSON.stringify(blockchain), 'utf8', () => {

    });
    res.status(200).send({ message: `saved to file ${fileName}` })
})

// app.get('/blockchain/fromfile', (req, res) => {
//     let fileName = 'sevchain-backup.json';

//     fs.readFile(`backups/${fileName}`, 'utf8', function readFileCallback(err, data) {
//         if (err) {
//             console.log(err);
//         } else {
//             blockchain = JSON.parse(data); //now it an object
//         }
//     });

//     res.status(200).send({ message: `saved to file ${fileName}` })
// })


/* ============= TRANSACTION ROUTES ============ */

app.get('/transaction', (req, res) => {
    console.log('[GET] /transaction')
    res.json(tp.transactions)
})

/**
 *  Example request json body.
 *  If sent `sender_pub` and `sender_priv` It will set this wallet as a sender wallet. If those 2 are not available, it will set
 *  node wallet as sender wallet. 
{
    "sender_pub": "041ff135ccbd5f023a81a411a2dbaa21cd06d23e6565e003d4c1f6d2a66e735c1cd2ddd358023a17d5efbc0b0496906531abe9fac70a5179246695dc40edb8e8b6ef",
    "sender_priv": "315cd1fcb38e8f89aa7438d62537469c05e592bf3c174ccb35ff9a26220a34fa",
    "recipient": "04fa71fa3923fe21bb81b9a169f567cc8ee2f8b19bd74275854382b3b2a9c717c35d0c7888a71a5d3f54c9b6be63b8e54615e8b2b259df413ef93e170564e71653b",
    "amount": 45
}
 */

app.post('/transaction', (req, res) => {
    console.log('[POST] /transaction')
    const { recipient, amount, sender_pub, sender_priv, data } = req.body
    let transaction = null
    if (sender_pub && sender_priv) {
        //console.log(`Sender address is set`);
        const senderWallet = new Wallet(sender_pub, sender_priv)
        transaction = wallet.createTransaction(recipient, amount, blockchain, tp, data, senderWallet)
        console.log("Created transaction with both wallet keys with value of: " + amount + " to wallet: " + recipient)
    } else {
        transaction = wallet.createTransaction(recipient, amount, blockchain, tp, data)
        console.log("Created transaction with value of: " + amount + " to wallet : " + recipient)
    }

    if (!(transaction instanceof Transaction)) {
        console.log(`Can't create transaction`);
        return res.status(400).send({
            "message": transaction
        })
    }

    p2pServer.broadcastTransaction(transaction)
    const response = miner.mine(true) // force automine transaction
    res.status(200).send({
        "message": response.message,
        "transaction": transaction
    })

})


/* ============= NODE ROUTES ============ */

app.get('/node/wallet/public-key', (req, res) => {
    console.log('/node/wallet/public-key')
    res.json({ publicKey: wallet.publicKey })
})

app.get('/node/wallet/balance', (req, res) => {
    console.log('[GET] /node/wallet/balance')
    res.json({ publicKey: wallet.publicKey, balance: wallet.balance })
})

// Mine transactions pool valid transactions to blockchain an earns reward
app.post('/node/mine-transactions', (req, res) => {
    console.log('[POST] /node/mine-transactions')
    const response = miner.mine();
    res.status(response.code).send(response)
})

app.get('/node/healthcheck', (req, res) => {
    console.log('[GET] /node/healthcheck')
    res.status(200).send({"message": "healthy"})
})

app.get('/node/registerednodes', (req, res) => {
    console.log('[GET] /node/registerednodes')
    res.status(200).send(PEERS_REGISTRY.getPeers())
})

app.get('/node/registeredseedservers', (req, res) => {
    console.log('[GET] /node/registeredseedservers')
    res.status(200).send(SEED_SERVERS)
})

/* ============= WALLET ROUTES ============ */

app.get('/wallet/balance/:walletAddress', (req, res) => {
    console.log('[GET] /wallet/balance/:walletAddress')
    const walletAddress = req.params.walletAddress
    console.log(`Find balance for wallet: ${walletAddress}`)
    const searchWalletBalance = Wallet.getBalance(blockchain, walletAddress)
    console.log(`Found balance for wallet: ${searchWalletBalance}`);
    res.json({ publicKey: wallet.publicKey, balance: searchWalletBalance })
})

app.get('/wallet/transactions/:walletAddress', (req, res) => {
    console.log('[GET] /wallet/transactions/:walletAddress')
    const walletAddress = req.params.walletAddress
    console.log(`Find transactions for wallet: ${walletAddress}`)
    const walletTransactions = Wallet.getWalletTransactions(blockchain, walletAddress)
    console.log(`Found transactions for wallet: ${walletTransactions.size}`);
    res.json(walletTransactions )
})

app.get('/wallet/create', (req, res) => {
    console.log('[GET] /wallet/create')
    const newWallet = new Wallet();
    const puKey = newWallet.getPublicKeyAsHexString();
    const prKey = newWallet.getPrivateKeyAsHexString();

    // Add some starting balance to new wallet
    const transaction = wallet.createTransaction(puKey, INITIAl_BALANCE, blockchain, tp)
    p2pServer.broadcastTransaction(transaction)

    const response = miner.mine(true); // force mine as wallet got starring balance
    console.log('Block mind after creating wallet. Transaction: ' + transaction.getId())
    res.json({
        publicKey: puKey,
        privateKey: prKey,
        balance: 0 //newWallet.balance
    })
})


app.listen(HTTP_PORT, () => log(`listening on port ${HTTP_PORT}`))

log(`This server: ${CURRENT_SERVER}`, LogsColours.BgWhite)
log(`Selected profile: ${PROFILE}`)

registerWithSeedServer() // auto-register with known seed servers
cronejob_get_peers_lists_from_seed_servers() // get list of active blockchain nodes from seed server

/*
* Start web socket server (Connection between SBC nodes)
*/
setTimeout(() => {
    p2pServer.listen();
}, 1000)

process.on('uncaughtException', function (err) {
    log("ERROR: uncaughtException", LogsColours.BgRed)
    console.log(err);
}); 
