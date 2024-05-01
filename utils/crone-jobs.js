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

module.exports = {
    cronejob_get_peers_lists_from_seed_servers
}