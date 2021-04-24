# tgbot
Telegram based bot to manage interactions with users. Current version supports predefined set of questions that users can ask by pressing the respective buttons. This tool can be easily extended to other advanced use cases like user queries, backend API integrations, database persistence etc.


## How to build a Telegram Bot?
Telegram bot can be coded in many languages. tgbot tool uses Nodejs. Please refer to https://github.com/hosein2398/node-telegram-bot-api-tutorial for the NPM package used in this code and other ways the package can be implemented.

## Step 1 - Setup your Bot account
This is a farily simple process. Telegram has a user called @BotFather. This is the quickest way to create your chat bot user. You can refer to https://core.telegram.org/bots#6-botfather for all details. Below are the exact things you need to do:
1. Start a session in your Telegram App and send a Hi note to @BotFather
2. Click /newbot in the response message
3. Provide a name to the bot. Like "My good bot" :)
4. Then choose a username ending with "_bot"
5. Note down the HTTP API access token that @BotFather returns. This token is the only thing you will need in the code to send and receive messages from users interacting with the bot. 

## Step 2 - Setup this application
1. Clone this code to your local machine
2. npm install
3. node server.js
4. Provide the API key in .env file
