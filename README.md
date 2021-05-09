# tgbot
Telegram based bot to manage interactions with users. Current version supports predefined set of questions that users can ask by pressing the respective buttons. Responses to users can be provided both in text and image formats. This tool can be easily extended to other advanced use cases like user queries, backend API integrations, database persistence etc.


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
5. Provide all messages in the messages input file
6. Formats of both the files is available in Samples folder

## Step 3 - Running the bot
1. `npm install`
2. `node server.js`
3. If you are running this on a EC2 or other Linux host, make sure the process keeps running even after SSH session terminated. Use "setsid" whicl starting
4. Other option is to use a Docker image
`sudo yum install -y docker`
`sudo systemctl start docker`
`sudo docker build -t vkivaturi/tgbot ~/tgbot/`
`sudo docker run --env-file ~/tgbot/.env -v /home/ec2-user:/home/ec2-user -d vkivaturi/tgbot`

## Key features of the bot
1. Setup standard messages in the input file. File format is row~tile~description. Tiles will appear in the chat window keyboard layout
2. Images are also supported in response to user input. 
3. External API calls are also supported. In this current code, Cowin website of Indian Government is called to fetch list of centers where vaccination slots are available.
4. Admin users can upload the messages file directly to the chat box. This upload will update the messages file.


