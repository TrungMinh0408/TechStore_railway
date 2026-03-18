import mongoose from "mongoose";
import Inventory from "../../models/Inventories.js";

export const getAll = async (req, res) => {
  try {
    const { branchId } = req.query;

    let filter = {};

    // nếu có branchId thì lọc theo chi nhánh
    if (branchId && mongoose.Types.ObjectId.isValid(branchId)) {
      filter.branchId = branchId;
    }

    const inventories = await Inventory.find(filter)
      .populate("productId", "name sku price")
      .populate("branchId", "name address")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (error) {
    console.error("Error fetching inventories:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};