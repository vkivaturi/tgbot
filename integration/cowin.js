const axios = require("axios");
const COWIN_URL_V2 = "https://cdn-api.co-vin.in/api/v2/";

//Cowin Service - Invoke Cowin APIs.

let cowin = {
    //Public search center is called without auth token
    searchCenterPublic: async (pincode, date) => {

        console.log("## Backend service search center : " + pincode + " " + date + " ");

        try {
            return await axios.get(COWIN_URL_V2 + 'appointment/sessions/public/calendarByPin?pincode=' + pincode + '&date=' + date );
        } catch (err) {
            // Handle Error Here
            console.error(err);
            return err.response;
        };
    },


};

module.exports = cowin;
