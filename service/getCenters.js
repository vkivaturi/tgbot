const centercache = require('../utils/centercache');
const cowin = require('../integration/cowin');
const moment = require('moment');

const TTL_SECS = 15 * 60;

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getCenters(msg, bot, keyboardLayout, pincode, place) {
    var userReturnMessage = "";
    //Fetch current date + 1 day. This is the default one used in search.
    //var date = moment().add(1, 'days').format('DD-MM-YYYY');
    var date = moment().format('DD-MM-YYYY');

    //Make a synchronous call to Cowin using Axios
    const getCentersFromCowin = async () => {

        //Call cowin service
        var response = await cowin.searchCenterPublic(pincode, date);

        if (response.status != undefined && response.status == "401") {
            //Access token is invalid or has expired
            userReturnMessage = response.data + '\n\n' + 'SEARCH_CENTER_PINCODE_ERROR';
        } else if (response.status != undefined && response.status == "400") {
            //Error in performing the search. Reasons like invalid pincode etc. Take user back to pincode
            userReturnMessage = response.data.error + '\n\n' + 'SEARCH_CENTER_PINCODE';
            console.log("$$ " + userReturnMessage);
        } else if (response.status != undefined && response.status == "200") {
            var refreshTime = moment().utcOffset("+05:30").format('DD-MMM-YYYY HH:mm');
            userReturnMessage = `🔹 Vaccine slots at *${place} ${pincode}* for coming 1 week. Last refreshed at ${refreshTime}\n\n`;
            //All good from Cowin. Process response data
            if (response.data.centers.length == 0) {
                //No centers found for the pincode
                userReturnMessage = userReturnMessage + "⛔ *Not open for booking*\n";
            } else {
                var centersList = response.data.centers;
                //console.log("# centersList " + JSON.stringify(centersList));

                for (let i = 0; i < centersList.length; i++) {
                    var _sessionsList = centersList[i].sessions;
                    var _dates = "";

                    //Fetch all available dates for the particular center
                    for (let j = 0; j < _sessionsList.length; j++) {
                        if (_sessionsList[j].available_capacity != "0") {
                            _dates = _dates + "✅ " + shortenDate(_sessionsList[j].date) + " for " + _sessionsList[j].min_age_limit + "+ yrs " + _sessionsList[j].vaccine + "\n";
                        }
                    }
                    _dates = _dates.length > 0 ? (_dates + "\n") : "❗ *All slots are booked*\n";
                    userReturnMessage = userReturnMessage +
                        centersList[i].name + ", " + centersList[i].block_name + ", " + centersList[i].district_name + "\n"
                        + _dates + "\n";
                }
            }
        } else {
            userReturnMessage = "Error in processing your request\n\n" + 'SEARCH_CENTER_PINCODE_ERROR';
        }
        //Set new data in cache
        centercache.set(pincode + place, userReturnMessage, TTL_SECS);

        //Send message back to user for this specific pin code
        bot.sendMessage(msg.chat.id, userReturnMessage, {
            "reply_markup": {
                "keyboard": keyboardLayout
            },
            "parse_mode": "MarkDown",
        });
    };

    //Check if cache already has the details for this pincode and location
    var centerdata = centercache.get(pincode + place);
    if (centerdata == undefined) {
        getCentersFromCowin();
    } else {
        bot.sendMessage(msg.chat.id, centerdata, {
            "reply_markup": {
                "keyboard": keyboardLayout
            },
            "parse_mode": "MarkDown",
        });
    }
}

function shortenDate(input) {
    var shortDate = "";
    if (input == null) {
        shortDate = "No date";
    } else {
        var dateArr = input.split("-");
        if (dateArr.length == 3) {
            shortDate = dateArr[0] + "-" + months[dateArr[1] - 1];
        } else {
            shortDate = "Invalid date"
        }

    }

    return shortDate;
}

module.exports = getCenters;
