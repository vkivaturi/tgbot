const TelegramBot = require('node-telegram-bot-api');
const { createLogger, transports, format } = require('winston');
const fs = require('fs');
const parse = require('csv-parse');
const dotenv = require("dotenv")

dotenv.config()

//Tgbot uses node-telegram-bot-api package. It keeps polling Telegram server to check for incoming messages and send outgoing messages

//Setup logger using Winston
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'usage.log', level: 'info' })
    ]
});

//Token to access Telegram bot API. This is obtained from @BotFather
const token = process.env.API_TOKEN;

//The real thing... bot!!
const bot = new TelegramBot(token, { polling: true });
bot.on("polling_error", console.log);

//This holds complete data from input messages file
var csvData = [];

//Data structure to hold the tiles displayed as user keyboard
var keyboardLayout = [];

//Data structure to hold the key value pair for title and details of each tile
var messageMap = new Map();

fs.createReadStream(process.env.MESSAGES_FILE)
    .pipe(parse({ delimiter: '~' }))
    .on('data', function (csvrow) {
        csvData.push(csvrow);
    })
    .on('end', function () {
        //Populate the two main data structure - Keboard layout and message map for lookups
        //Ignore header row in csv file
        for (var rowIndx = 1; rowIndx < csvData.length; rowIndx++) {
            var _rowArr = csvData[rowIndx];

            //Populate message map for all records
            messageMap.set(_rowArr[1], _rowArr[2]);

            //Index in input files starts at 1. Hence reduce it
            var _rowNum = _rowArr[0] - 1;
            if (Array.isArray(keyboardLayout[_rowNum])) {
                keyboardLayout[_rowNum].push(_rowArr[1]);
            } else {
                keyboardLayout[_rowNum] = new Array();
                keyboardLayout[_rowNum].push(_rowArr[1]);
            }
        }
    });

const errmessage = "Sorry. You have replied with an unrecognized text. Please use one of the below buttons to interact with this bot";

var message = "";

//Process input message sent by the user.
bot.on('message', (msg) => {
    var inputtext = msg.text.toString();

    if (messageMap.get(inputtext) != undefined) {
        //User entered value is found in message map
        logger.info(`${msg.chat.id}#${msg.from.username}#${msg.from.first_name}#${inputtext}`);
        //Regex is needed to convert all instances of \n newline chacter in input to proper newline in string.
        message = messageMap.get(inputtext).replace(/\\n/g, '\r\n');
    } else if (msg.text.toString().startsWith('\/start') || msg.text.toString().toLowerCase() == "hi" || msg.text.toString().toLowerCase() == "hello") {
        logger.info(`${msg.chat.id}#${msg.from.username}#${msg.from.first_name}#Start`);
        message = "Welcome " + msg.from.first_name + ". Please use one of the options presented below the chat window";
    } else {
        logger.info(`${msg.chat.id}#${msg.from.username}#${msg.from.first_name}#Error input#${msg.text.toString()}`);
        message = errmessage;
    }
    sendMessage(msg, message);
});

function sendMessage(msg, message) {
    bot.sendMessage(msg.chat.id, message, {
        "reply_markup": {
            "keyboard": keyboardLayout
        }
    });
}
