import crypto from "crypto";
import qs from "qs";
import { checkoutPOS } from "./checkoutController.js";
// 🔹 Tạo URL thanh toán
import Payment from "../../models/payment.js";

const tmnCode = "HOQSPK33";
const secretKey = "BDNAIEK6P8RGMFXU9XOI55BNFRP60E4B";
const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const returnUrl = "https://techstorerailway-copy-production.up.railway.app/vnpay-return";

// 🔹 sort object
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
}

export const createPayment = async (req, res) => {
    try {
        const { amount, items } = req.body;

        console.log("==== CREATE VNPAY ====");
        console.log("BODY:", req.body);

        // 🔥 create payment DB
        const payment = await Payment.create({
            items,
            method: "vnpay",
            amount,
            status: "pending"
        });

        const orderId = payment._id.toString();

        // 🔥 createDate format yyyyMMddHHmmss
        const date = new Date();
        const createDate = date
            .toISOString()
            .replace(/[-:TZ.]/g, "")
            .slice(0, 14);

        // 🔥 VNPay params
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
            vnp_IpAddr: req.ip || "127.0.0.1",
            vnp_CreateDate: createDate,
            vnp_BankCode: "NCB"
        };

        // 🔥 sort params
        vnp_Params = sortObject(vnp_Params);

        // 🔥 build signData (QUAN TRỌNG NHẤT)
        const signData = Object.keys(vnp_Params)
            .sort()
            .map(key => {
                return `${key}=${encodeURIComponent(vnp_Params[key])}`;
            })
            .join("&");

        console.log("SIGN DATA:", signData);

        // 🔥 create secure hash
        const secureHash = crypto
            .createHmac("sha512", secretKey)
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        // 🔥 final URL
        const paymentUrl =
            vnpUrl +
            "?" +
            qs.stringify({
                ...vnp_Params,
                vnp_SecureHashType: "HmacSHA512",
                vnp_SecureHash: secureHash
            }, { encode: true });

        console.log("👉 PAYMENT URL:", paymentUrl);

        return res.json({ paymentUrl });
    } catch (err) {
        console.error("❌ VNPAY ERROR:", err);

        return res.status(500).json({
            message: err.message,
            stack: err.stack
        });
    }
};

// 🔹 IPN (webhook)
export const vnpayIPN = async (req, res) => {
    let vnp_Params = { ...req.query };

    const secureHash = vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHash;

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });

    const checkHash = crypto
        .createHmac("sha512", secretKey)
        .update(signData)
        .digest("hex");

    if (secureHash === checkHash) {

        const orderId = vnp_Params.vnp_TxnRef;
        const payment = await Payment.findOne({ orderId });

        if (!payment) {
            return res.json({ RspCode: "01", Message: "Not found" });
        }

        // 🔥 chống duplicate
        if (payment.status === "completed") {
            return res.json({ RspCode: "00", Message: "Already processed" });
        }

        if (vnp_Params.vnp_ResponseCode === "00") {

            await checkoutPOS({
                body: {
                    items: payment.items,
                    paymentMethod: "vnpay",
                    customerName: "VNPay"
                },
                user: {
                    id: payment.staffId,
                    branchId: payment.branchId
                }
            }, {
                json: () => { }
            });

            payment.status = "completed";
            await payment.save();

        }
    }

    return res.json({ RspCode: "00", Message: "success" });
};