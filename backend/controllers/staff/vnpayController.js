import crypto from "crypto";
import qs from "qs";
import Payment from "../../models/payment.js";
import { checkoutPOS } from "./checkoutController.js";

const tmnCode = "HOQSPK33";
const secretKey = "BDNAIEK6P8RGMFXU9XOI55BNFRP60E4B";
const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const returnUrl =
    "https://techstorerailway-copy-production.up.railway.app/vnpay-return";

/* ================= CLEAN PARAMS ================= */
import crypto from "crypto";
import qs from "qs";
import Payment from "../../models/payment.js";

/* ================= CLEAN ================= */
function cleanParams(obj) {
    const res = {};
    for (const k in obj) {
        if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
            res[k] = obj[k];
        }
    }
    return res;
}

/* ================= SORT ================= */
function sortObject(obj) {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = obj[key];
        });
    return sorted;
}

/* ================= CREATE PAYMENT ================= */
export const createVNPay = async (req, res) => {
    try {
        const { amount } = req.body;

        console.log("===== VNPay CREATE =====");

        const payment = await Payment.create({
            amount,
            method: "vnpay",
            status: "pending",
        });

        const orderId = payment._id.toString();

        const createDate = new Date()
            .toISOString()
            .replace(/[-:TZ.]/g, "")
            .slice(0, 14);

        /* ================= IP (FIX RAILWAY) ================= */
        const ipAddr =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket?.remoteAddress ||
            "127.0.0.1";

        /* ================= PARAMS ================= */
        let vnp_Params = cleanParams({
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: tmnCode,
            vnp_Amount: amount * 100,
            vnp_CurrCode: "VND",
            vnp_TxnRef: orderId,
            vnp_OrderInfo: "Thanh toan don hang",
            vnp_OrderType: "other",
            vnp_Locale: "vn",
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
            vnp_BankCode: "NCB",
        });

        /* ================= SORT ================= */
        vnp_Params = sortObject(vnp_Params);

        /* ================= SIGN STRING ================= */
        const signData = Object.keys(vnp_Params)
            .sort()
            .map((key) => `${key}=${vnp_Params[key]}`)
            .join("&");

        console.log("===== SIGN DATA =====");
        console.log(signData);

        /* ================= HASH ================= */
        const secureHash = crypto
            .createHmac("sha512", secretKey)
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        console.log("===== SECURE HASH =====");
        console.log(secureHash);

        /* ================= FINAL URL ================= */
        const paymentUrl =
            vnpUrl +
            "?" +
            qs.stringify(
                {
                    ...vnp_Params,
                    vnp_SecureHashType: "HmacSHA512",
                    vnp_SecureHash: secureHash,
                },
                { encode: true }
            );

        console.log("===== PAYMENT URL =====");
        console.log(paymentUrl);

        return res.json({ paymentUrl });
    } catch (err) {
        console.error("VNPay ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
};

/* ================= IPN ================= */
export const vnpayIPN = async (req, res) => {
    try {
        let vnp_Params = { ...req.query };

        const secureHash = vnp_Params.vnp_SecureHash;

        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        vnp_Params = sortObject(vnp_Params);

        const signData = Object.keys(vnp_Params)
            .sort()
            .map((key) => `${key}=${vnp_Params[key]}`)
            .join("&");

        const checkHash = crypto
            .createHmac("sha512", secretKey)
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        console.log("===== VERIFY =====");
        console.log("SIGN:", signData);
        console.log("VNPay:", secureHash);
        console.log("CHECK:", checkHash);

        if (secureHash !== checkHash) {
            return res.send("Invalid signature");
        }

        return res.send("Payment success");
    } catch (err) {
        console.error(err);
        return res.send("Error");
    }
};