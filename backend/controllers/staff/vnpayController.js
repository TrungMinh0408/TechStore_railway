import crypto from "crypto";
import Payment from "../../models/payment.js";

/* ================= CONFIG ================= */
const tmnCode = "HOQSPK33";
const secretKey = "BDNAIEK6P8RGMFXU9XOI55BNFRP60E4B";
const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

const returnUrl =
    "https://techstorerailway-copy-production.up.railway.app/vnpay-return";

/* ================= SORT + BUILD ================= */
function buildQuery(params) {
    return Object.keys(params)
        .sort()
        .map(key => {
            return key + "=" + encodeURI(params[key])
                .replace(/%20/g, "+"); // giữ +
        })
        .join("&");
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

        let ipAddr =
            // req.headers["x-forwarded-for"] ||
            // req.socket?.remoteAddress ||
            "127.0.0.1";

        if (ipAddr.includes(",")) ipAddr = ipAddr.split(",")[0];
        if (ipAddr.includes("::ffff:")) ipAddr = ipAddr.replace("::ffff:", "");

        const vnp_Params = {
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

        // 🔥 SIGN DATA (CHUẨN)
        const signData = buildQuery(vnp_Params);

        console.log("===== SIGN DATA =====");
        console.log(signData);

        const secureHash = crypto
            .createHmac("sha512", secretKey)
            .update(signData, "utf-8")
            .digest("hex");

        console.log("===== HASH =====");
        console.log(secureHash);

        // 🔥 FINAL URL (PHẢI GIỐNG SIGN)
        const paymentUrl =
            vnpUrl +
            "?" +
            signData +
            "&vnp_SecureHashType=HmacSHA512" +
            "&vnp_SecureHash=" +
            secureHash;

        console.log("===== PAYMENT URL =====");
        console.log(paymentUrl);

        return res.json({ paymentUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

/* ================= IPN ================= */
export const vnpayIPN = async (req, res) => {
    try {
        let vnp_Params = { ...req.query };

        const secureHash = vnp_Params.vnp_SecureHash;

        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        const signData = buildQuery(vnp_Params);

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