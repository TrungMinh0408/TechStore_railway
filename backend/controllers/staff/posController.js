import Product from "../../models/Product.js";
import Inventory from "../../models/Inventories.js";
import mongoose from "mongoose";

export const getPosProducts = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 40;
        const category = req.query.category;

        const branchId = req.user.branchId;

        let filter = { isActive: true };

        if (category) {
            filter.categoryId = new mongoose.Types.ObjectId(category);
        }

        const products = await Product.find(filter)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const inventories = await Inventory.find({
            branchId
        });

        const result = products.map(p => {

            const inv = inventories.find(i =>
                i.productId.toString() === p._id.toString()
            );

            return {
                ...p.toObject(),
                stock: inv ? inv.quantity : 0
            };

        });

        console.log("FILTER:", filter);
        console.log("PRODUCT COUNT:", result.length);

        res.json({
            success: true,
            products: result
        });

    } catch (error) {

        console.error("POS PRODUCT ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};