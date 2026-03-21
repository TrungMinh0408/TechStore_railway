import crypto from "crypto";
import qs from "qs";
import Payment from "../../models/payment.js";
import { checkoutPOS } from "./checkoutController.js";

const tmnCode = "HOQSPK33";
const secretKey = "BDNAIEK6P8RGMFXU9XOI55BNFRP60E4B";
const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const returnUrl =
    "https://techstorerailway-copy-production.up.railway.app/vnpay-return";

// 🔹 sort object
function sortObject(obj) {
    const sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = obj[key];
        });
    return sorted;
}

// 🔥 CREATE PAYMENT
export const createPayment = async (req, res) => {
    try {
        const { amount, items } = req.body;

        console.log("==== CREATE VNPAY ====");
        console.log("BODY:", req.body);

        const payment = await Payment.create({
            items,
            method: "vnpay",
            amount,
            status: "pending",
        });

        const orderId = payment._id.toString();

        // 🔥 VNPay format yyyyMMddHHmmss
        const date = new Date();
        const createDate = date
            .toISOString()
            .replace(/[-:TZ.]/g, "")
            .slice(0, 14);

        // 🔥 IMPORTANT: dùng IPv4 cố định
        const ipAddr = "127.0.0.1";

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

        // 🔥 sort params
        vnp_Params = sortObject(vnp_Params);

        // 🔥 SIGN DATA (QUAN TRỌNG: KHÔNG encodeURIComponent)
        const signData = qs.stringify(vnp_Params, { encode: false });

        console.log("SIGN DATA:", signData);

        // 🔥 CREATE HASH
        const secureHash = crypto
            .createHmac("sha512", secretKey)
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        // 🔥 FINAL URL
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

        console.log("👉 PAYMENT URL:", paymentUrl);

        return res.json({ paymentUrl });
    } catch (err) {
        console.error("❌ VNPAY ERROR:", err);
        return res.status(500).json({
            message: err.message,
        });
    }
};

// 🔥 IPN (WEBHOOK)
export const vnpayIPN = async (req, res) => {
    try {
        let vnp_Params = { ...req.query };

        const secureHash = vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHash;
        delete vnp_Params.vnp_SecureHashType;

        vnp_Params = sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });

        const checkHash = crypto
            .createHmac("sha512", secretKey)
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        if (secureHash !== checkHash) {
            return res.json({ RspCode: "97", Message: "Invalid signature" });
        }

        const orderId = vnp_Params.vnp_TxnRef;

        const payment = await Payment.findById(orderId);

        if (!payment) {
            return res.json({ RspCode: "01", Message: "Order not found" });
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
                {
                    json: () => { },
                }
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