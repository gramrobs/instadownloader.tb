# Robert's Social Downloader Tool

## Info

- 2021/1/15 Robert Makeev
- This is a telegram bot for downloading instagram and twitter's original photo
- contains API for Web and for Bot
- Backend API is built with Express & Cheerio & puppeteer
- Telegam Bot is built with node-telegram-bot-api

## Feature

- [X] IG image
- [X] IG video
- [X] IG Story image
- [X] IG Story video
- [X] Twitter image
- [X] Twitter video
- [X] Error handling
- [X] Web
- [X] Line

## Input

- Instagram
  - https://www.instagram.com/p/[postId]/
  - https://instagram.com/[userName] //stories
  - https://www.instagram.com/[userName] //stories
- Twitter
  - https://twitter.com/[userName]/status/[postId]
- Seperate multi urls with new line

## Try it on Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

#### in order to let the bot work, set up the following vars in heroku setting

- insCookies: [instagram login cookie]
- insPass: [instagram account password]
- insEmail: [instagram account email]
- NODE_ENV: production
- telegramToken: [telegram bot token, you can recieve it from bot father]
- url: https://[your heroku project name].herokuapp.com
- lineAccessToken: [line bot token]
- lineSecret: [line bot secret]
- twitterToken: [twitter bearer token for api access]

cause the region difference, I highly recommend not to use your own instagram account in this bot.
