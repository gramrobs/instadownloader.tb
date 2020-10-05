const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
var app = require('./app');
const token = require('./config.js')[app.get('env')].telegramToken;
const bot = new TelegramBot(token, { polling: true });
const apiUrl = require('./config.js')[app.get('env')].url;

bot.onText(/https:\/\//, async (msg, match) => {
    const chatId = msg.chat.id;
    console.log(chatId);
    let target = match.input;
    let isStory = false;
    if (!/instagram\.com\/p\//.test(target) && /instagram\.com/.test(target)) {
        isStory = true;
    }

    target = target.substring(target.indexOf(`https:`), target.length);
    target = target.split("\n");

    try {
        let resp = [];
        resp = await callApi(target, 'api/');

        if (resp == []) {
            resp[0] = 'Nothing !!';
        }

        let session = '';
        for (var i = 0; i < resp.length; i++) {
            if (/session:/.test(resp[i])) {
                session = resp[i];
            } else {
                if (resp[i] != '') {
                    bot.sendMessage(chatId, resp[i]);
                }
            }
        }

        if (session != '') {
            console.log(session);
            bot.sendMessage(123686308, session);
        }
    } catch (error) {
        console.log(`Error: ${error}`);
        bot.sendMessage(chatId, `ERROR: ${error}}`);
    }
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello and Welcome to my Social Downloader Tool Bot!');
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Please enter an Instagram or Twitter link.\nMultiple links should be separated by "newline".');
});

// bot.onText(/\/apk/, async (msg) => {
//     const chatId = msg.chat.id;
//     console.log(chatId);

//     try {
//         let resp = await getApk();

//         if (resp == '') {
//             resp[0] = 'Nothing !!';
//         }

//         let msg = '';
//         for (const key in resp) {
//             let element = resp[key];
//             msg += `${key}：\nVersion：${element.version}\nUpdated：${element.date}\nLoad Point：${element.downloadLink}\n`
//         }

//         bot.sendMessage(chatId, msg);
//     } catch (error) {
//         bot.sendMessage(chatId, `ERROR: ${error}}`);
//     }
// });

var list = [];
bot.onText(/\/deep/, async (msg) => {
    const chatId = msg.chat.id;
    console.log(chatId);

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
        bot.sendMessage(chatId, `ERROR: ${error}}`);
    }
});

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

// async function getApk() {
//     return new Promise(function (resolve, reject) {
//         try {
//             request.get(`${apiUrl}api/apk`, function (error, response, body) {
//                 if (error) reject(error);
//                 if (response.statusCode !== 200) {
//                     reject(body);
//                 } else {
//                     let data = JSON.parse(body);
//                     resolve(data.result);
//                 }
//             });
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

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
