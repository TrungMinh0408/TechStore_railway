import mongoose from "mongoose";
import Purchase from "../../models/Purchase.js";
import StockMovement from "../../models/StockMovement.js";
import Inventory from "../../models/Inventories.js";
import Product from "../../models/Product.js";
import Supplier from "../../models/Supplier.js";
import Branch from "../../models/Branch.js";
import User from "../../models/User.js";
import UserBranch from "../../models/UserBranches.js";
import Log from "../../models/Log.js";

export const createPurchase = async (req, res) => {
  try {
    const {
      supplierId,
      branchId,
      productId,
      quantity,
      costPrice,
      note,
    } = req.body;

    const managerId = req.user?.id;

    if (!supplierId || !branchId || !productId || !quantity || !costPrice) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if (!managerId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (Number(quantity) <= 0 || Number(costPrice) <= 0) {
      return res.status(400).json({
        message: "Quantity and cost price must be greater than 0",
      });
    }

    const purchase = await Purchase.create({
      supplierId,
      branchId,
      managerId,
      productId,
      quantity: Number(quantity),
      costPrice: Number(costPrice),
      note: note || "",
      status: "pending",
    });

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate("supplierId", "name phone email")
      .populate("branchId", "name code")
      .populate("managerId", "name email role")
      .populate("productId", "name sku price costPrice");

    // 🔹 LOG (không để fail API)
    try {
      await Log.create({
        actorId: managerId,
        branchId: branchId,
        action: "CREATE_PURCHASE",
        targetType: "PURCHASE",
        targetId: purchase._id,
        message: "Manager created a purchase order",
        details: {
          supplierId,
          productId,
          quantity,
          costPrice,
        },
        status: "SUCCESS",
        ip: req.ip,
        device: req.headers["user-agent"],
      });
    } catch (logError) {
      console.error("Log error:", logError);
    }

    return res.status(201).json({
      message: "Purchase created successfully",
      data: populatedPurchase,
    });

  } catch (error) {
    console.error("createPurchase error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Lấy danh sách phiếu nhập
export const getAllPurchases = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, fromDate, toDate } = req.query;

    // tìm branch của user
    const userBranch = await UserBranch.findOne({ userId });

    if (!userBranch) {
      return res.status(403).json({
        message: "User is not assigned to any branch",
      });
    }

    const filter = {
      branchId: userBranch.branchId,
    };

    // filter status
    if (status) {
      filter.status = status;
    }

    // filter theo ngày
    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }

      if (toDate) {
        filter.createdAt.$lte = new Date(toDate);
      }
    }

    const purchases = await Purchase.find(filter)
      .populate("supplierId", "name phone email")
      .populate("branchId", "name code")
      .populate("managerId", "name email role")
      .populate("productId", "name sku price costPrice")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Purchases fetched successfully",
      data: purchases,
    });
  } catch (error) {
    console.error("getAllPurchases error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Lấy chi tiết 1 phiếu nhập
export const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await Purchase.findById(id)
      .populate("supplierId", "name phone email address")
      .populate("branchId", "name code address")
      .populate("managerId", "name email role phone")
      .populate("productId", "name sku price costPrice unit");

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      message: "Purchase fetched successfully",
      data: purchase,
    });
  } catch (error) {
    console.error("getPurchaseById error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Cập nhật phiếu nhập khi còn pending
export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierId, productId, quantity, costPrice, note, status } = req.body;

    const managerId = req.user?.id;
    const branchId = req.user?.branchId;

    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    if (purchase.status !== "pending") {
      return res.status(400).json({
        message: "Only pending purchases can be updated",
      });
    }

    if (status && status !== "pending") {
      return res.status(400).json({
        message: "Use confirm/cancel endpoint to change status",
      });
    }

    if (quantity !== undefined && Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0",
      });
    }

    if (costPrice !== undefined && Number(costPrice) <= 0) {
      return res.status(400).json({
        message: "Cost price must be greater than 0",
      });
    }

    // lưu lại dữ liệu cũ để log
    const oldData = {
      supplierId: purchase.supplierId,
      productId: purchase.productId,
      quantity: purchase.quantity,
      costPrice: purchase.costPrice,
      note: purchase.note,
    };

    if (supplierId) purchase.supplierId = supplierId;
    if (productId) purchase.productId = productId;
    if (quantity !== undefined) purchase.quantity = Number(quantity);
    if (costPrice !== undefined) purchase.costPrice = Number(costPrice);
    if (note !== undefined) purchase.note = note;

    await purchase.save();

    // 🔹 Activity log
    try {
      await Log.create({
        level: "INFO",
        actorId: managerId,
        branchId: branchId,
        action: "UPDATE_PURCHASE",
        targetType: "PURCHASE",
        targetId: purchase._id,
        message: "Manager updated purchase order",
        details: {
          before: oldData,
          after: {
            supplierId: purchase.supplierId,
            productId: purchase.productId,
            quantity: purchase.quantity,
            costPrice: purchase.costPrice,
            note: purchase.note,
          },
        },
        status: "SUCCESS",
        ip: req.ip,
        device: req.headers["user-agent"],
      });
    } catch (logError) {
      console.error("Log error:", logError);
    }

    const updatedPurchase = await Purchase.findById(id)
      .populate("supplierId", "name phone email")
      .populate("branchId", "name code")
      .populate("managerId", "name email role")
      .populate("productId", "name sku price costPrice");

    res.status(200).json({
      message: "Purchase updated successfully",
      data: updatedPurchase,
    });

  } catch (error) {
    console.error("updatePurchase error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Xác nhận đơn nhập hàng -> cộng kho + tạo stock movement
export const confirmPurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const managerId = req.user?.id;

    const purchase = await Purchase.findById(id).session(session);

    if (!purchase) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    if (purchase.status === "confirmed") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Purchase already confirmed",
      });
    }

    if (purchase.status === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Cancelled purchase cannot be confirmed",
      });
    }

    let inventory = await Inventory.findOne({
      branchId: purchase.branchId,
      productId: purchase.productId,
    }).session(session);

    if (!inventory) {
      inventory = new Inventory({
        branchId: purchase.branchId,
        productId: purchase.productId,
        quantity: 0,
      });
    }

    inventory.quantity += purchase.quantity;
    await inventory.save({ session });

    await StockMovement.create(
      [
        {
          productId: purchase.productId,
          branchId: purchase.branchId,
          quantity: purchase.quantity,
          type: "in",
          source: "purchase",
          purchaseId: purchase._id,
          note: purchase.note || "Purchase confirmed",
        },
      ],
      { session }
    );

    purchase.status = "confirmed";
    await purchase.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 🔹 Activity Log
    try {
      await Log.create({
        level: "INFO",
        actorId: managerId,
        branchId: purchase.branchId,
        action: "CONFIRM_PURCHASE",
        targetType: "PURCHASE",
        targetId: purchase._id,
        message: "Manager confirmed purchase order",
        details: {
          productId: purchase.productId,
          quantity: purchase.quantity,
        },
        status: "SUCCESS",
        ip: req.ip,
        device: req.headers["user-agent"],
      });
    } catch (logError) {
      console.error("Log error:", logError);
    }

    const confirmedPurchase = await Purchase.findById(id)
      .populate("supplierId", "name phone email")
      .populate("branchId", "name code")
      .populate("managerId", "name email role")
      .populate("productId", "name sku price costPrice");

    res.status(200).json({
      message: "Purchase confirmed successfully",
      data: confirmedPurchase,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("confirmPurchase error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Hủy phiếu nhập
export const cancelPurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const managerId = req.user?.id;
    const branchId = req.user?.branchId;

    if (!managerId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    if (purchase.status === "confirmed") {
      return res.status(400).json({
        message: "Confirmed purchase cannot be cancelled",
      });
    }

    if (purchase.status === "cancelled") {
      return res.status(400).json({
        message: "Purchase already cancelled",
      });
    }

    purchase.status = "cancelled";
    await purchase.save();

    // 🔹 Activity Log
    try {
      await Log.create({
        level: "INFO",
        actorId: managerId,
        branchId: branchId,
        action: "CANCEL_PURCHASE",
        targetType: "PURCHASE",
        targetId: purchase._id,
        message: "Manager cancelled purchase order",
        status: "SUCCESS",
        ip: req.ip,
        device: req.headers["user-agent"],
      });
    } catch (logError) {
      console.error("Log error:", logError);
    }

    return res.status(200).json({
      message: "Purchase cancelled successfully",
      data: purchase,
    });

  } catch (error) {
    console.error("cancelPurchase error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Xóa phiếu nhập khi còn pending/cancelled
export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const managerId = req.user?.id;
    const branchId = req.user?.branchId;

    if (!managerId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    if (purchase.status === "confirmed") {
      return res.status(400).json({
        message: "Confirmed purchase cannot be deleted",
      });
    }

    await Purchase.findByIdAndDelete(id);

    // 🔹 Activity log
    try {
      await Log.create({
        level: "WARN",
        actorId: managerId,
        branchId: branchId,
        action: "DELETE_PURCHASE",
        targetType: "PURCHASE",
        targetId: purchase._id,
        message: "Manager deleted purchase order",
        details: {
          supplierId: purchase.supplierId,
          productId: purchase.productId,
          quantity: purchase.quantity,
        },
        status: "SUCCESS",
        ip: req.ip,
        device: req.headers["user-agent"],
      });
    } catch (logError) {
      console.error("Log error:", logError);
    }

    return res.status(200).json({
      message: "Purchase deleted successfully",
    });

  } catch (error) {
    console.error("deletePurchase error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const returnPurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const managerId = req.user?.id;
    const reason = req.body?.reason || "Return to supplier";

    const purchase = await Purchase.findById(id).session(session);

    if (!purchase) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Purchase not found",
      });
    }

    if (purchase.status !== "confirmed") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Only confirmed purchase can be returned",
      });
    }

    const userBranch = await UserBranch.findOne({
      userId: managerId,
      branchId: purchase.branchId,
    }).session(session);

    if (!userBranch) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "You cannot return purchase from another branch",
      });
    }

    const inventory = await Inventory.findOne({
      branchId: purchase.branchId,
      productId: purchase.productId,
    }).session(session);

    if (!inventory || inventory.quantity < purchase.quantity) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Not enough stock to return",
      });
    }

    // trừ kho
    inventory.quantity -= purchase.quantity;
    await inventory.save({ session });

    // stock movement
    await StockMovement.create(
      [
        {
          productId: purchase.productId,
          branchId: purchase.branchId,
          quantity: purchase.quantity,
          type: "out",
          source: "return",
          purchaseId: purchase._id,
          note: reason,
        },
      ],
      { session }
    );

    purchase.status = "returned";
    await purchase.save({ session });

    await session.commitTransaction();
    session.endSession();

    // 🔹 Activity log (ngoài transaction để tránh fail)
    try {
      await Log.create({
        level: "INFO",
        actorId: managerId,
        branchId: purchase.branchId,
        action: "RETURN_PURCHASE",
        targetType: "PURCHASE",
        targetId: purchase._id,
        message: "Manager returned purchase to supplier",
        details: {
          productId: purchase.productId,
          quantity: purchase.quantity,
          reason: reason,
        },
        status: "SUCCESS",
        ip: req.ip,
        device: req.headers["user-agent"],
      });
    } catch (logError) {
      console.error("Log error:", logError);
    }

    const returnedPurchase = await Purchase.findById(id)
      .populate("supplierId", "name")
      .populate("branchId", "name")
      .populate("managerId", "name")
      .populate("productId", "name sku");

    res.status(200).json({
      message: "Purchase returned successfully",
      data: returnedPurchase,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("returnPurchase error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};