const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

async function testPayment() {
    const amount = 100;
    const expire_by = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const customer = {
        name: "Test User",
        email: "test@example.com",
    };
    const description = "Test Payment";
    const currency = "INR";

    try {
        const response = await axios.post(
            "https://api.razorpay.com/v1/payment_links",
            {
                currency: currency,
                amount: amount * 100, // amount in paise
                expire_by,
                customer,
                description,
                accept_partial: false,
                reference_id: Math.random().toString(36).substr(2, 9),
            },
            {
                headers: {
                    Authorization: `Basic ${process.env.RAZORPAY_AUTH_TOKEN}`,
                },
            }
        );
        console.log("Success:", response.data);
    } catch (error) {
        console.error("Error creating payment link:", error.response ? error.response.data : error.message);
    }
}

testPayment();
