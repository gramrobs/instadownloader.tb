const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
var app = require('./app');
const token = require('./config.js')[app.get('env')].telegramToken;
const bot = new TelegramBot(token, { polling: true });
const apiUrl = require('./config.js')[app.get('env')].url;
const crawler = require('./crawler.js');

bot.onText(/https:\/\//, async (msg, match) => {
    const chatId = msg.chat.id;
    let logName = msg.from.username || msg.from.first_name || msg.from.id;
    let chatMsg = match.input;

    try {
        let target = chatMsg.match(/(?:https:\/\/www\.instagram\.com\/p\/\S{11}\/)|(?:https:\/\/(?:www\.)?instagram\.com\/\S+)|(?:https:\/\/(?:mobile\.)?twitter\.com\/\S+\/[0-9]+)/g);
        let isPup = (chatMsg.match(/-pup/i) !== null) ? true : false;
        let forceUpdate = (chatMsg.match(/--f/i) !== null) ? true : false;

        if (target == null) {
            throw new Error(`The URL is not currently supported!`);
        }
        console.log(`[LOG][Telegram] ${logName}`);
        let resp = await crawler.getImage(target, isPup, forceUpdate);;

        if (resp.length !== 0) {
            let resArr = [];
            for (let i = 0; i < resp.length; i++) {
                resArr = resArr.concat(resp[i]);
            }

            for (var i = 0; i < resArr.length; i++) {
                if (resArr[i] != '') {
                    if (/mp4|jpe?g|png/.test(resArr[i])) {
                        try {
                            await bot.sendDocument(chatId, resArr[i]);
                        } catch (error) {
                            console.log(`[ERROR] sendDocument error: ${error}`);
                            await bot.sendMessage(chatId, resArr[i]);
                        }

                    } else {
                        await bot.sendMessage(chatId, resArr[i]);
                    }
                }
            }
        } else {
            bot.sendMessage(chatId, 'Nothing !!');
        }
    } catch (error) {
        console.log(`[ERROR] ${error}`);
        bot.sendMessage(chatId, `error: ${error}`);
    }
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello and Welcome to my Social Downloader Tool Bot!');
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please enter an Instagram or Twitter link.\nPlease separate multiple links with "newline"');
});

// bot.onText(/\/apk/, async (msg) => {
//     const chatId = msg.chat.id;
//     let logName = msg.from.username || msg.from.first_name || msg.from.id;
//     console.log(`[LOG][Telegram][/apk] ${logName}`);

//     try {
//         let resp = await getApk();

//         if (resp == '') {
//             resp[0] = '沒東西啦 !!';
//         }

//         let msg = '';
//         for (const key in resp) {
//             let element = resp[key];
//             msg += `${key}：\n版本：${element.version}\n更新日期：${element.date}\n載點：${element.downloadLink}\n`
//         }

//         bot.sendMessage(chatId, msg);
//     } catch (error) {
//         bot.sendMessage(chatId, `出錯了: ${error}}`);
//     }
// });

var list = [];
bot.onText(/\/deep/, async (msg) => {
    const chatId = msg.chat.id;
    let logName = msg.from.username || msg.from.first_name || msg.from.id;
    console.log(`[LOG][Telegram][/deep] ${logName}`);

    try {
        let resp = await checkDeep();

        let msg = '';
        let links = '';
        for (const key in resp) {
            let element = resp[key];
            if (list.includes(key) === false) {
                msg += `${element.updateTime}  ${element.name}  ${element.title}\n`;
                links += `${element.link}\n`;
                list.push(`${element.name}_${element.title}`);
            }
        }

        if (list.length !== 0) {
            list.forEach((element,index) => {
                if (!(element in resp)) {
                    list.splice(index, 1);
                }
            });
        }

        if (msg === '') {
            msg = 'No Updates';
        } else {
            //msg += `\n${links}`;
        }

        bot.sendMessage(chatId, msg);
    } catch (error) {
        bot.sendMessage(chatId, `error: ${error}}`);
    }
});

// Deprecated, switch to direct function call
async function callApi(urls, route) {
    return new Promise(function (resolve, reject) {
        try {
            request.post(`${apiUrl}${route}`, { form: { url: urls } }, function (error, response, body) {
                if (error) reject(error);
                if (response.statusCode !== 200) {
                    reject(body);
                } else {
                    let data = JSON.parse(body);
                    data = data.url;
                    resolve(data.split(","));
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function getApk() {
    return new Promise(function (resolve, reject) {
        try {
            request.get(`${apiUrl}api/apk`, function (error, response, body) {
                if (error) reject(error);
                if (response.statusCode !== 200) {
                    reject(body);
                } else {
                    let data = JSON.parse(body);
                    resolve(data.result);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function checkDeep() {
    return new Promise(function (resolve, reject) {
        try {
            request.get(`${apiUrl}api/deep`, function (error, response, body) {
                if (error) reject(error);
                if (response.statusCode !== 200) {
                    reject(body);
                } else {
                    let data = JSON.parse(body);
                    resolve(data.result);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}
