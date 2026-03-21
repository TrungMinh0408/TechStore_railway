import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserBranch from "../models/UserBranches.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("========== AUTH CHECK ==========");
  console.log("Full Authorization Header:", authHeader);

  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.error("❌ Token not found in header");
    return res.status(401).json({ message: "Không có token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("========== TOKEN DECODED ==========");
    console.log(decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.error("❌ User not found in DB:", decoded.id);

      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }

    let userBranch = null;

    if (decoded.branchId) {
      userBranch = await UserBranch.findOne({
        userId: user._id,
        branchId: decoded.branchId,
      });

      if (!userBranch) {
        console.error("❌ User not in branch");

        return res.status(403).json({
          message: "User không thuộc branch này",
        });
      }
    }

    console.log("========== AUTHENTICATED USER ==========");
    console.log({
      id: user._id,
      email: user.email,
      role: user.role,
      branchId: decoded.branchId,
      branchRole: decoded.branchRole,
    });

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      branchId: decoded.branchId || null,
      branchRole: decoded.branchRole || null,
      isActive: user.isActive,
    };

    console.log("========== REQUEST USER SET ==========");
    console.log(req.user);

    return next(); // ⚠️ QUAN TRỌNG KHÔNG ĐƯỢC THIẾU
  } catch (error) {
    console.error("❌ Token Verification Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;