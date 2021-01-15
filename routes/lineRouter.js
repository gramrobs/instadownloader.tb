const express = require('express');
const line = require('@line/bot-sdk');
const crawler = require('../crawler.js');
const router = express.Router();
const lineAccessToken = require('../config.js')[process.env.NODE_ENV].lineAccessToken;
const lineSecret = require('../config.js')[process.env.NODE_ENV].lineSecret;

const config = {
    channelAccessToken: lineAccessToken,
    channelSecret: lineSecret
};

router.post('/webhook', (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.status(200).json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

const client = new line.Client(config);
async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    let msg = event.message.text;
    let id = (event.source.groupId == undefined) ? event.source.userId : event.source.groupId;
    id = (event.source.roomId == undefined) ? event.source.userId : event.source.roomId;
    let targetArr = msg.match(/(?:https:\/\/www\.instagram\.com\/p\/\S{11}\/)|(?:https:\/\/(?:www\.)?instagram\.com\/\S+)|(?:https:\/\/(?:mobile\.)?twitter\.com\/\S+\/[0-9]+)/g);
    let isPup = (msg.match(/-pup/i) !== null) ? true : false;
    let forceUpdate = (msg.match(/--f/i) !== null) ? true : false;
    let res = [];

    if (targetArr != null) {
        await client.getProfile(event.source.userId)
        .then((profile) => {
            console.log(`[LOG][LINE] ${profile.displayName} ${profile.pictureUrl}`);
        });
        try {
            res = await crawler.getImage(targetArr, isPup, forceUpdate);
            if (res.length !== 0) {
                let newArr = [];
                for (let i = 0; i < res.length; i++) {
                    newArr = newArr.concat(res[i]);
                }

                if (newArr.length > 0) {
                    // For self-use, if reply is insufficient, use push to make up
                    // let replyMsgArrObj = [];
                    // let pushMsgArrObj = [];
                    // for (let i = 0; i < newArr.length; i++) {
                    //     let currentMsg = newArr[i];
                    //     if (i < 5) {
                    //         if (/\.mp4/.test(currentMsg)) {
                    //             replyMsgArrObj.push({
                    //                 'type': 'video',
                    //                 "originalContentUrl": currentMsg,
                    //                 "previewImageUrl": "https://pbs.twimg.com/profile_images/1269685818345394176/lPyLjEXz_400x400.jpg"
                    //             });
                    //         } else if (/\.jpe?g|\.png/i.test(currentMsg)) {
                    //             replyMsgArrObj.push({
                    //                 'type': 'image',
                    //                 "originalContentUrl": currentMsg,
                    //                 "previewImageUrl": currentMsg
                    //             });
                    //         } else {
                    //             replyMsgArrObj.push({
                    //                 'type': 'text',
                    //                 'text': currentMsg
                    //             });
                    //         }
                    //     } else {
                    //         if (/\.mp4/.test(currentMsg)) {
                    //             pushMsgArrObj.push({
                    //                 'type': 'video',
                    //                 "originalContentUrl": currentMsg,
                    //                 "previewImageUrl": "https://pbs.twimg.com/profile_images/1269685818345394176/lPyLjEXz_400x400.jpg"
                    //             });
                    //         } else if (/\.jpe?g|\.png/i.test(currentMsg)) {
                    //             pushMsgArrObj.push({
                    //                 'type': 'image',
                    //                 "originalContentUrl": currentMsg,
                    //                 "previewImageUrl": currentMsg
                    //             });
                    //         } else {
                    //             pushMsgArrObj.push({
                    //                 'type': 'text',
                    //                 'text': currentMsg
                    //             });
                    //         }
                    //     }
                    // }

                    // For public use, when there are more than five pictures, pictures other than the first four pictures will be sent in the form of URL
                    let replyMsgArrObj = [];
                    let txtMsg = 'Due to Line Api limitation, the remaining images are in the form of URLs, please click on the URL to save images as\n';
                    for (let i = 0; i < newArr.length; i++) {
                        let currentMsg = newArr[i];
                        if (newArr.length <= 5) {
                            if (/\.mp4/.test(currentMsg)) {
                                replyMsgArrObj.push({
                                    'type': 'video',
                                    "originalContentUrl": currentMsg,
                                    "previewImageUrl": "https://robertssocialdownloadertool.herokuapp.com/img/instagram-square.png"
                                });
                            } else if (/\.jpe?g|\.png/i.test(currentMsg)) {
                                replyMsgArrObj.push({
                                    'type': 'image',
                                    "originalContentUrl": currentMsg,
                                    "previewImageUrl": currentMsg
                                });
                            } else {
                                replyMsgArrObj.push({
                                    'type': 'text',
                                    'text': currentMsg
                                });
                            }
                        } else {
                            if (i < 4) {
                                if (/\.mp4/.test(currentMsg)) {
                                    replyMsgArrObj.push({
                                        'type': 'video',
                                        "originalContentUrl": currentMsg,
                                        "previewImageUrl": "https://pbs.twimg.com/profile_images/1269685818345394176/lPyLjEXz_400x400.jpg"
                                    });
                                } else if (/\.jpe?g|\.png/i.test(currentMsg)) {
                                    replyMsgArrObj.push({
                                        'type': 'image',
                                        "originalContentUrl": currentMsg,
                                        "previewImageUrl": currentMsg
                                    });
                                } else {
                                    replyMsgArrObj.push({
                                        'type': 'text',
                                        'text': currentMsg
                                    });
                                }
                            } else {
                                txtMsg += `- ${currentMsg}\n`;
                            }
                        }
                    }

                    if (newArr.length > 5) {
                        replyMsgArrObj.push({
                            'type': 'text',
                            'text': txtMsg
                        });
                    }

                    client.replyMessage(event.replyToken, replyMsgArrObj)
                        .catch((err) => {
                            console.error(err);
                        });

                    // client.pushMessage(id, pushMsgArrObj)
                    //     .catch((err) => {
                    //         console.error(err);
                    //     });
                } else {
                    client.replyMessage(event.replyToken, [{
                        'type': 'text',
                        'text': 'No picture is found, or the other party is a private account'
                    }]).catch((err) => {
                        console.error(err);
                    });
                }
            }
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    } else {
        if (/https:\/\/www\.instagram\.com\/tv\//.test(msg)) {
            client.replyMessage(event.replyToken, [{
                'type': 'text',
                'text': 'IGTV download is not yet supported ～'
            }]).catch((err) => {
                console.error(err);
            });
        }
    }

    return true;
}

module.exports = router;
