import Inventory from "../../models/Inventories.js";
import UserBranch from "../../models/userBranches.js";

export const getAll = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userBranch = await UserBranch.findOne({
      userId,
      role: "branch_manager",
    });

    if (!userBranch || !userBranch.branchId) {
      return res.status(403).json({
        success: false,
        message: "Manager is not assigned to any branch",
      });
    }

    const inventories = await Inventory.find({
      branchId: userBranch.branchId,
    })
      .populate("productId", "name sku price")
      .populate("branchId", "name address")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (error) {
    console.error("Error fetching manager inventories:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const Details = async (req, res) => {
  try {
    const { productId } = req.params;

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userBranch = await UserBranch.findOne({
      userId,
      role: "branch_manager",
    });

    if (!userBranch || !userBranch.branchId) {
      return res.status(403).json({
        success: false,
        message: "Manager is not assigned to any branch",
      });
    }

    // inventory hiện tại
    const inventory = await Inventory.findOne({
      branchId: userBranch.branchId,
      productId,
    })
      .populate("productId", "name sku price")
      .populate("branchId", "name address");

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
    }

    // lịch sử nhập xuất
    const movements = await StockMovement.find({
      branchId: userBranch.branchId,
      productId,
    })
      .populate("purchaseId", "quantity costPrice status")
      .populate("saleId", "totalAmount status")
      .sort({ createdAt: -1 });

    // log liên quan tới product
    const logs = await Log.find({
      branchId: userBranch.branchId,
      "details.productId": productId,
    })
      .populate("actorId", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      data: {
        inventory,
        movements,
        logs,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory details:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};