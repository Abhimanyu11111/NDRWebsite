import CryptoJS from "crypto-js";
import dotenv from "dotenv";
dotenv.config();

export const initiatePayment = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // 1️⃣ Payment parameters
        const orderParams = {
            merchant_id: process.env.CCA_MERCHANT_ID,
            order_id: bookingId,
            currency: "INR",
            amount,
            redirect_url: process.env.CCA_REDIRECT_URL,
            cancel_url: process.env.CCA_CANCEL_URL,
            language: "EN"
        };

        // 2️⃣ Convert to key=value form
        let formData = "";
        for (let key in orderParams) {
            formData += `${key}=${orderParams[key]}&`;
        }

        // 3️⃣ Encrypt using working key
        const encryptedData = CryptoJS.AES.encrypt(
            formData,
            CryptoJS.enc.Utf8.parse(process.env.CCA_WORKING_KEY),
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7,
            }
        ).toString();

        // 4️⃣ Return to frontend
        res.json({
            success: true,
            paymentUrl: `https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction&encRequest=${encryptedData}&access_code=${process.env.CCA_ACCESS_CODE}`
        });


    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Payment init failed" });
    }
};
import { db } from "../src/config/db.js";

export const handleCallback = async (req, res) => {
    try {
        const encResponse = req.body.encResp;
        const workingKey = process.env.CCA_WORKING_KEY;

        // 1️⃣ Decrypt
        const decoded = CryptoJS.AES.decrypt(
            encResponse,
            CryptoJS.enc.Utf8.parse(workingKey),
            {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7,
            }
        ).toString(CryptoJS.enc.Utf8);

        console.log("DECRYPTED:", decoded);

        // 2️⃣ Extract booking id + status
        const parts = decoded.split("&");
        let order_id = null;
        let status = null;

        parts.forEach(p => {
            if (p.startsWith("order_id")) order_id = p.split("=")[1];
            if (p.startsWith("order_status")) status = p.split("=")[1];
        });

        if (!order_id) return res.send("No booking found");

        // 3️⃣ Update booking
        if (status === "Success") {
            await db.query("UPDATE bookings SET status='paid' WHERE id=?", [order_id]);
            return res.redirect("http://localhost:3000/payment-success");
        } else {
            await db.query("UPDATE bookings SET status='cancelled' WHERE id=?", [order_id]);
            return res.redirect("http://localhost:3000/payment-failed");
        }

    } catch (err) {
        console.log(err);
        res.send("Error handling callback");
    }
};
