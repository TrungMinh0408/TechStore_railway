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
function cleanParams(obj) {
    const res = {};
    for (const key in obj) {
        const value = obj[key];
        if (value !== undefined && value !== null && value !== "") {
            res[key] = value;
        }
    }
    return res;
}

/* ================= SORT PARAMS ================= */
function sortParams(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {});
}

/* ================= CREATE PAYMENT ================= */
export const createPayment = async (req, res) => {
    try {
        const { amount, items } = req.body;

        console.log("===== VNPay CREATE =====");

        const payment = await Payment.create({
            items,
            method: "vnpay",
            amount,
            status: "pending",
        });

        const orderId = payment._id.toString();

        const createDate = new Date()
            .toISOString()
            .replace(/[-:TZ.]/g, "")
            .slice(0, 14);

        /* ⚠️ FIX IP (QUAN TRỌNG) */
        const ipAddr = "127.0.0.1";

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
        vnp_Params = sortParams(vnp_Params);

        /* ================= SIGN DATA (ABSOLUTE STANDARD) ================= */
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
        let vnp_Params = cleanParams({ ...req.query });

        const secureHash = vnp_Params.vnp_SecureHash;

        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        vnp_Params = sortParams(vnp_Params);

        const signData = Object.keys(vnp_Params)
            .sort()
            .map((key) => `${key}=${vnp_Params[key]}`)
            .join("&");

        const checkHash = crypto
            .createHmac("sha512", secretKey)
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        console.log("===== IPN DEBUG =====");
        console.log("SIGN:", signData);
        console.log("VNPay:", secureHash);
        console.log("CHECK:", checkHash);

        if (secureHash !== checkHash) {
            return res.json({ RspCode: "97", Message: "Invalid signature" });
        }

        const orderId = vnp_Params.vnp_TxnRef;

        const payment = await Payment.findById(orderId);

        if (!payment) {
            return res.json({ RspCode: "01", Message: "Not found" });
        }

        if (payment.status === "completed") {
            return res.json({ RspCode: "02", Message: "Already processed" });
        }

        if (vnp_Params.vnp_ResponseCode === "00") {
            await checkoutPOS(
                {
                    body: {
                        items: payment.items,
                        paymentMethod: "vnpay",
                        customerName: "VNPay",
                    },
                    user: {
                        id: payment.staffId,
                        branchId: payment.branchId,
                    },
                },
                { json: () => { } }
            );

            payment.status = "completed";
            await payment.save();
        }

        return res.json({ RspCode: "00", Message: "Success" });
    } catch (err) {
        console.error(err);
        return res.json({ RspCode: "99", Message: "Error" });
    }
};