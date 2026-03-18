import QRCode from "qrcode";
import Sale from "../../models/Sale.js";
import Payment from "../../models/payment.js";
import Inventory from "../../models/Inventories.js";
import StockMovement from "../../models/StockMovement.js";
import Log from "../../models/Log.js";

export const checkoutPOS = async (req, res) => {
    try {
        const { items, paymentMethod, customerName } = req.body;

        const staffId = req.user.id;
        const branchId = req.user.branchId;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart empty"
            });
        }

        let grandTotal = 0;

        for (const item of items) {
            const quantity = item.qty || item.quantity;
            const price = item.price;
            grandTotal += quantity * price;
        }

        // =========================
        // 🔥 CASE VNPAY
        // =========================
        if (paymentMethod === "vnpay") {
            return res.status(400).json({
                message: "Use VNPay API instead"
            });
        }

        // =========================
        // 🔥 CREATE SALES (QR + CASH)
        // =========================
        const sales = [];

        for (const item of items) {
            const quantity = item.qty || item.quantity;
            const price = item.price;
            const totalAmount = quantity * price;

            const sale = await Sale.create({
                productId: item.productId,
                staffId,
                branchId,
                customerName: customerName || "Walk-in",
                quantity,
                price,
                totalAmount,
                status: paymentMethod === "qr" ? "pending" : "paid"
            });

            sales.push(sale);
        }

        const saleIds = sales.map(s => s._id);

        // =========================
        // 🔥 QR
        // =========================
        if (paymentMethod === "qr") {

            const payment = await Payment.create({
                saleIds,
                method: "qr",
                amount: grandTotal,
                status: "pending"
            });

            const BASE_URL = "https://your-ngrok-url";

            const qrContent = `${BASE_URL}/api/staff/pos/confirm-qr/${payment._id}`;
            const qrImage = await QRCode.toDataURL(qrContent);

            return res.json({
                success: true,
                paymentMethod: "qr",
                paymentId: payment._id,
                qr: qrImage,
                amount: grandTotal
            });
        }

        // =========================
        // 🔥 CASH
        // =========================
        for (const sale of sales) {

            const inventory = await Inventory.findOne({
                productId: sale.productId,
                branchId
            });

            if (!inventory || inventory.quantity < sale.quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Not enough stock"
                });
            }

            inventory.quantity -= sale.quantity;
            await inventory.save();

            await StockMovement.create({
                productId: sale.productId,
                branchId,
                quantity: sale.quantity,
                type: "out",
                source: "sale"
            });
        }

        await Payment.create({
            saleIds,
            method: "cash",
            amount: grandTotal,
            status: "completed"
        });

        await Log.create({
            actorId: staffId,
            branchId,
            action: "CREATE_SALE",
            description: `Sale created via POS. Total: ${grandTotal}`
        });

        return res.json({
            success: true,
            paymentMethod: "cash",
            total: grandTotal
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const confirmQRPayment = async (req, res) => {
    try {

        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId);

        if (!payment) return res.send("Payment not found");

        if (payment.status === "completed") {
            return res.send("Already paid");
        }

        // 🔥 LẤY TẤT CẢ SALE
        const sales = await Sale.find({
            _id: { $in: payment.saleIds }
        });

        for (const sale of sales) {

            const inventory = await Inventory.findOne({
                productId: sale.productId,
                branchId: sale.branchId
            });

            if (inventory) {
                inventory.quantity -= sale.quantity;
                await inventory.save();

                await StockMovement.create({
                    productId: sale.productId,
                    branchId: sale.branchId,
                    quantity: sale.quantity,
                    type: "out",
                    source: "sale"
                });
            }

            sale.status = "paid";
            await sale.save();
        }

        payment.status = "completed";
        await payment.save();

        res.send(`
            <h2>Thanh toán thành công</h2>
            <p>Bạn có thể đóng trang này</p>
        `);

    } catch (error) {
        console.error(error);
        res.send("Payment error");
    }
};

export const getPaymentStatus = async (req, res) => {

    try {

        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.json({
            status: payment.status
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};