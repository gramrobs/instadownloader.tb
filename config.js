var config = {
    development: {
        telegramToken: '1157076530:AAEvVTHKiedGWfvoaZcWUHw9H3RQdCb-wHU',
        insEmail: 'instadownloader.tb',
        insPass: '0plm9okn',
        port: 8080,
        insCookies: '38964512370%3AOj37edGgu3AnlZ%3A16',
        url: 'https://robertssocialdownloadertoolbot.herokuapp.com:8080/',
        deepSite: null
    },
    production: {
        telegramToken: process.env.telegramToken,
        insEmail: process.env.insEmail,
        insPass: process.env.insPass,
        port: process.env.PORT,
        insCookies: process.env.insCookies,
        url: process.env.url,
        deepSite: process.env.deepSite
    }
}

if (process.env.NODE_ENV != 'production') {
    config.development['telegramToken'] = require('./cred.js').telegramToken;
    config.development['insEmail'] = require('./cred.js').insEmail;
    config.development['insPass'] = require('./cred.js').insPass;
    config.development['insCookies'] = require('./cred.js').insCookies;
    config.development['deepSite'] = require('./cred.js').deepSite;
}

module.exports = config;
