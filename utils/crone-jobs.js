const { CronJob } = require('cron')
const { log } = require('./colours');
const { getPeerListFromAllKnownSeedServers } = require('./utils');


function cronejob_get_peers_lists_from_seed_servers() {
    new CronJob(
        '*/4 * * * * *', // evey 5 seconds
        function () {
            getPeerListFromAllKnownSeedServers()
        }, // onTick
        null, // onComplete
        true, // start
        'Europe/London' // timeZone
    );
}

function cronejob_mine_pool_transactions(miner, seconds) {
    new CronJob(
        '*/'+seconds+ ' * * * * *', // evey 5 seconds
        function () {
            log("Autominer crone job")
            miner.mine(true);
        }, // onTick
        null, // onComplete
        true, // start
        'Europe/London' // timeZone
    );
}

module.exports = {
    cronejob_get_peers_lists_from_seed_servers,
    cronejob_mine_pool_transactions
}