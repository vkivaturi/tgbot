const TelegramBot = require('node-telegram-bot-api');
const { createLogger, transports, format } = require('winston');
const fs = require('fs');
const parse = require('csv-parse');
const dotenv = require("dotenv");
const loadmessages = require('./utils/loadmessages');

const getCenters = require('./service/getCenters');


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
    ]
});

//Token to access Telegram bot API. This is obtained from @BotFather
const token = process.env.API_TOKEN;

//To avoid spamming, we will restrict the bot to download not more that 4 images in a message
const MAX_IMAGE_DOWNLOAD = 4;

//To avoid spamming, we will restrict the bot to make not more that 4 backend seervice calls in a message
const MAX_SERIVCE_CALLS = 4;


//The real thing... bot!!
const bot = new TelegramBot(token, { polling: true });
bot.on("polling_error", console.log);

//This holds complete data from input messages file
//var csvData = [];

//Data structure to hold the tiles displayed as user keyboard
var keyboardLayout = [];

//Data structure to hold the key value pair for title and details of each tile
var messageMap = new Map();

loadmessages.process(messageMap, keyboardLayout);

const errmessage = "Sorry. You have replied with an unrecognized text. It is also possible that our options have changed from the last time that you have interacted with the bot.\n\nPlease use one of the below buttons to interact with this bot";

var message = "";

//Process input message sent by the user.
bot.on('message', async (msg) => {

    //Feature 1 : Message file defines the questions, answers and keyboard layout of the bot. This file can be updated by Admin users only
    if (msg.document && process.env.ADMIN_USERS.includes(msg.from.username)) {
        logger.info(msg.document.file_id);
        logger.info(msg.document.file_name);

        var downloadFolder = process.env.MESSAGES_FOLDER;
        bot.downloadFile(msg.document.file_id, downloadFolder).then(function (filePath) {
            var absoluteFile = downloadFolder + '/' + process.env.MESSAGES_FILE;

            fs.rename(filePath, absoluteFile, function (err, response) {
                if (err) {
                    return console.log(err);
                }
                logger.info('File uploaded and has been renamed');
                //Reload the message in memory and update the keyboard
                keyboardLayout = [];
                messageMap = new Map();
                loadmessages.process(messageMap, keyboardLayout);

                var fileprocessedmessage = 'New messages are updated and available through the bot now';
                logger.info(fileprocessedmessage);
                sendMessage(msg, fileprocessedmessage);
            });
        });

    } else if (msg.text) {
        //Feature 2 - Process text message sent by user and respond
        var inputtext = msg.text.toString();

        if (messageMap.get(inputtext) != undefined) {
            //User entered value is found in message map
            logger.info(`${msg.chat.id}#${msg.from.username}#${msg.from.first_name}#${inputtext}`);
            //Regex is needed to convert all instances of \n newline chacter in input to proper newline in string.
            message = messageMap.get(inputtext).replace(/\\n/g, '\r\n');
            sendMessage(msg, message);
        } else if (msg.text.toString().startsWith('\/start') || msg.text.toString().toLowerCase() == "hi" || msg.text.toString().toLowerCase() == "hello") {
            logger.info(`${msg.chat.id}#${msg.from.username}#${msg.from.first_name}#Start`);
            message = "Welcome " + msg.from.first_name + ". Please use one of the options presented below the chat window";
            sendMessage(msg, message);
            // } else if (msg.text.toString().toLowerCase() == "cowin") {
            //     logger.info(`${msg.chat.id}#${msg.from.username}#${msg.from.first_name}#CowinCenterSearch`);
            //     message = getCenters(msg, sendMessage);
        } else {
            logger.info(`${msg.chat.id}#${msg.from.username}#${msg.from.first_name}#Error input#${msg.text.toString()}`);
            message = errmessage;
            sendMessage(msg, message);
        }


    } else {
        logger.info(`${msg.chat.id}#${msg.from.username}#${msg.from.first_name}#Error input#Invalid input type`);
        message = "Message type that you have sent is currentl not supported. Please use one of the below buttons to interact with this bot";
        sendMessage(msg, message);
    }

});

//Function that sends message back the user, images to user and also render the keyboard tiles
function sendMessage(msg, message) {
    if (message.startsWith("Image:")) {

        var imageArray = message.replace("Image:", "").split(",");
        for (var i = 0; i < MAX_IMAGE_DOWNLOAD && i < imageArray.length; i++) {
            bot.sendPhoto(msg.chat.id, imageArray[i], {
                "reply_markup": {
                    "keyboard": keyboardLayout
                }
            });
        }
    } if (message.startsWith("Cowin:")) {

        var pincodeArray = message.replace("Cowin:", "").split(",");
        for (var i = 0; i < MAX_SERIVCE_CALLS && i < pincodeArray.length; i++) {
            //Further fetch pincode and location name from the input string
            var pincode = pincodeArray[i].split("-")[0];
            var place = pincodeArray[i].split("-")[1];
            getCenters(msg, bot, keyboardLayout, pincode, place);
        }
    } else {
        bot.sendMessage(msg.chat.id, message, {
            "reply_markup": {
                "keyboard": keyboardLayout
            }
        });
    }
}
