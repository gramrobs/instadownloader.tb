var config = {
    development: {
        telegramToken: '1157076530:AAERJnfEWR9iV8ii3rrdp1RA7SXHLEgJL5E',
        insEmail: '_evgevg2002_',
        insPass: 'Z"v%j2x9SL>$Niby',
        port: 8080,
        insCookies: 'BcJ1ZmwKsDxzlNxu6eAIQw',
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
