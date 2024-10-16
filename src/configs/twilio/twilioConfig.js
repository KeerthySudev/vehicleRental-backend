const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Replace with your Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Replace with your Twilio Auth Token
const verifySid = process.env.TWILIO_VERIFY_SID; // Replace with your Verify Service SID

const twilioClient = twilio(accountSid, authToken)

module.exports={verifySid, twilioClient};