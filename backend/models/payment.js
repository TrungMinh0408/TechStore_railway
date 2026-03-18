import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    saleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
        required: true,
      }
    ],

    method: {
      type: String,
      enum: ["cash", "visa", "qr", "vnpay"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);