const axios = require("axios");
const COWIN_URL_V2 = "https://cdn-api.co-vin.in/api/v2/";

//Cowin Service - Invoke Cowin APIs.

let cowin = {
    //Public search center is called without auth token
    searchCenterPublic: async (pincode, date) => {

        const headers = {
            headers: {
                "Accept": "application/json, text/plain, */*",
                "user-agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
            },
        };

        console.log("## Backend service search center : " + pincode + " " + date + " ");

        try {
            return await axios.get(COWIN_URL_V2 + 'appointment/sessions/public/calendarByPin?pincode=' + pincode + '&date=' + date, headers );
        } catch (err) {
            // Handle Error Here
            console.error(err);
            return err.response;
        };
    },


};

module.exports = cowin;
