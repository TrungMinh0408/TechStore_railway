import crypto from "crypto";
import qs from "qs";
import Payment from "../../models/payment.js";

/* ================= CONFIG ================= */
const tmnCode = "HOQSPK33";
const secretKey = "BDNAIEK6P8RGMFXU9XOI55BNFRP60E4B";
const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

const returnUrl =
    "https://techstorerailway-copy-production.up.railway.app/vnpay-return";

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
export const createPayment = async (req, res) => {
    try {
        const { amount } = req.body;

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

        const ipAddr =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket?.remoteAddress ||
            "127.0.0.1";

        let vnp_Params = {
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
        };

        // 🔥 SORT
        vnp_Params = sortObject(vnp_Params);

        // 🔥 SIGN DATA (QUAN TRỌNG NHẤT)
        const signData = qs.stringify(vnp_Params, {
            encode: false, // ❗ KHÔNG encode
        });

        console.log("===== SIGN DATA =====");
        console.log(signData);

        const secureHash = crypto
            .createHmac("sha512", secretKey)
            .update(signData, "utf-8")
            .digest("hex");

        console.log("===== HASH =====");
        console.log(secureHash);

        // 🔥 URL (encode thật)
        const paymentUrl =
            vnpUrl +
            "?" +
            qs.stringify(
                {
                    ...vnp_Params,
                    vnp_SecureHashType: "HmacSHA512",
                    vnp_SecureHash: secureHash,
                },
                {
                    encode: true, // encode ở đây
                }
            );

        console.log("===== PAYMENT URL =====");
        console.log(paymentUrl);

        return res.json({ paymentUrl });
    } catch (err) {
        console.error(err);
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

        // 🔥 SORT
        vnp_Params = Object.keys(vnp_Params)
            .sort()
            .reduce((obj, key) => {
                obj[key] = vnp_Params[key];
                return obj;
            }, {});

        // 🔥 SIGN DATA giống createPayment
        const signData = qs.stringify(vnp_Params, { encode: false });

        const checkHash = crypto
            .createHmac("sha512", secretKey)
            .update(signData, "utf-8")
            .digest("hex");

        console.log("===== IPN DEBUG =====");
        console.log("SIGN:", signData);
        console.log("VNPay:", secureHash);
        console.log("CHECK:", checkHash);

        if (secureHash !== checkHash) {
            return res.json({ RspCode: "97", Message: "Invalid Signature" });
        }

        return res.json({ RspCode: "00", Message: "Success" });
    } catch (err) {
        console.error(err);
        return res.json({ RspCode: "99", Message: "Error" });
    }
};