const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const parse = require('csv-parse');

//Data structure to hold the tiles displayed as user keyboard
//var keyboardLayout = [];

//Data structure to hold the key value pair for title and details of each tile
//var messageMap = new Map();

let loadmessages = {
    process: (messageMap, keyboardLayout) => {
        //This holds complete data from input messages file
        var csvData = [];

        fs.createReadStream(process.env.MESSAGES_FOLDER+process.env.MESSAGES_FILE)
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
    }
}

module.exports = loadmessages;