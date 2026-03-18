import Product from "../../models/Product.js";

export const getHomeProducts = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 40;

        const products = await Product.find({ isActive: true })
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};