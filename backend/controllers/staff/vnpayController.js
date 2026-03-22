import crypto from "crypto";
import Payment from "../../models/payment.js";

/* ================= CONFIG ================= */
const tmnCode = "HOQSPK33";
const secretKey = "BDNAIEK6P8RGMFXU9XOI55BNFRP60E4B";
const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

const returnUrl =
    "https://techstorerailway-copy-production.up.railway.app/vnpay-return";

/* ================= BUILD DUY NHẤT ================= */
// 🔥 DÙNG CHUNG CHO SIGN + URL
function buildQuery(params) {
    return Object.keys(params)
        .sort()
        .map(key => {
            return (
                key +
                "=" +
                encodeURIComponent(params[key]).replace(/%20/g, "+")
            );
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
            vnp_IpAddr: "127.0.0.1",
            vnp_CreateDate: createDate,
            vnp_BankCode: "NCB",
        };

        console.log("========== RAW PARAMS ==========");
        Object.keys(vnp_Params)
            .sort()
            .forEach(key => {
                console.log(key + " =", vnp_Params[key]);
            });

        // 🔥 CHUỖI DUY NHẤT
        const query = buildQuery(vnp_Params);

        console.log("========== SIGN & URL BASE ==========");
        console.log(query);

        const secureHash = crypto
            .createHmac("sha512", secretKey)
            .update(query, "utf-8")
            .digest("hex");

        console.log("========== HASH ==========");
        console.log(secureHash);

        const paymentUrl =
            vnpUrl +
            "?" +
            query +
            "&vnp_SecureHashType=HmacSHA512" +
            "&vnp_SecureHash=" +
            secureHash;

        console.log("========== FINAL URL ==========");
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

        console.log("========== IPN RAW ==========");
        Object.keys(vnp_Params)
            .sort()
            .forEach(key => {
                console.log(key + " =", vnp_Params[key]);
            });

        // 🔥 DÙNG CÙNG HÀM
        const query = buildQuery(vnp_Params);

        const checkHash = crypto
            .createHmac("sha512", secretKey)
            .update(query, "utf-8")
            .digest("hex");

        console.log("========== IPN DEBUG ==========");
        console.log("QUERY:", query);
        console.log("VNPay HASH:", secureHash);
        console.log("LOCAL HASH:", checkHash);

        if (secureHash !== checkHash) {
            return res.json({ RspCode: "97", Message: "Invalid Signature" });
        }

        return res.json({ RspCode: "00", Message: "Success" });
    } catch (err) {
        console.error(err);
        return res.json({ RspCode: "99", Message: "Error" });
    }
};