# FFRKBot
[![Build Status](https://travis-ci.org/brasstax/ffrkbot.svg?branch=master)](https://travis-ci.org/brasstax/ffrkbot)
## What
A simple Discord bot using [discord.js](https://discord.js.org).
Uses a JSON copy of [Enlir's FFRK database](https://docs.google.com/spreadsheets/d/16K1Zryyxrh7vdKVF1f7eRrUAOC5wuzvC3q2gFLch6LQ).

## Usage
* `npm install` to install the requirements from package.json.
* Copy `config.json.example` to `config.json` and replace the token
with your own Discord bot token.
* Replace the owner with your own Discord ID.
* `node ffrkbot.js` to run the bot.
* To run the bot in the background, run `runbot.sh` so that the bot respawns if it crashes abnormally.

## Google credentials
Google credentials are needed if you're doing stuff with the speedrun functionality.
Follow the directions at [Google Developer's quickstart](https://developers.google.com/sheets/api/quickstart/nodejs) and save your
`credentials.json` and `client_secret.json` to the `secrets` folder.

# License
MIT.
