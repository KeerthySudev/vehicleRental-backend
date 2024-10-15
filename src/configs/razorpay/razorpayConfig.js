const Razorpay = require('razorpay');

// Initialize Razorpay instance with your Key and Secret
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,      // Your Razorpay Key ID
    key_secret: process.env.RAZORPAY_KEY_SECRET,  // Your Razorpay Secret
});

module.exports =  razorpay;