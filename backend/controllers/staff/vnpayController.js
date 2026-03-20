import crypto from "crypto";
import qs from "qs";
import { checkoutPOS } from "./checkoutController.js";
// 🔹 Tạo URL thanh toán
import Payment from "../../models/payment.js";

const tmnCode = "HOQSPK33";
const secretKey = "BDNAIEK6P8RGMFXU9XOI55BNFRP60E4B";
const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const returnUrl = "https://techstorerailway-copy-production.up.railway.app/vnpay-return";

function sortObject(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = obj[key];
            return acc;
        }, {});
}



export const createPayment = async (req, res) => {
    try {
        const { amount, items } = req.body;
        console.log("==== CREATE VNPAY ====");
        console.log("BODY:", req.body);
        console.log("USER:", req.user);
        console.log("ITEMS:", items);

        const payment = await Payment.create({
            items,
            method: "vnpay",
            amount,
            status: "pending"
        });

        const orderId = payment._id.toString();

        const date = new Date();
        const createDate = date
            .toISOString()
            .replace(/[-:TZ.]/g, "")
            .slice(0, 14);
        let vnp_Params = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: tmnCode,
            vnp_Amount: amount * 100,
            vnp_CurrCode: "VND",
            vnp_TxnRef: orderId,
            vnp_OrderInfo: "Thanh_toan_don_hang",
            vnp_OrderType: "other",

            vnp_Locale: "vn",              // 🔥 THÊM
            vnp_BankCode: "NCB",          // 🔥 THÊM (sandbox rất hay cần)

            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: "127.0.0.1",
            vnp_CreateDate: createDate,
        };

        vnp_Params = sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });

        const secureHash = crypto
            .createHmac("sha512", secretKey)
            .update(signData)
            .digest("hex");

        const paymentUrl =
            vnpUrl +
            "?" +
            qs.stringify({
                ...vnp_Params,
                vnp_SecureHashType: "HmacSHA512",
                vnp_SecureHash: secureHash
            });
        console.log("👉 AFTER CREATE PAYMENT");
        console.log("👉 PAYMENT URL:", paymentUrl);
        return res.json({ paymentUrl });
    } catch (err) {
        console.error("❌ VNPAY CREATE ERROR:");
        console.error(err); // 🔥 cái này mới quan trọng

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