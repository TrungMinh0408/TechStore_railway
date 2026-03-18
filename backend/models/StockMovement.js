import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["in", "out"],
      required: true,
    },

    source: {
      type: String,
      enum: ["purchase", "sale", "return"],
      required: true,
    },

    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },

    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
    },

    note: String,
  },
  { timestamps: true }
);

export default mongoose.model("StockMovement", stockMovementSchema);