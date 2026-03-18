import Log from "../../models/Log.js";
import UserBranch from "../../models/userBranches.js";

import mongoose from "mongoose";

export const getAllLogs = async (req, res) => {
  try {
    const managerBranchId = req.user?.branchId;
    const managerBranchRole = req.user?.branchRole;

    if (!managerBranchId) {
      return res.status(403).json({
        message: "Your account is not assigned to any branch",
      });
    }

    if (managerBranchRole !== "branch_manager") {
      return res.status(403).json({
        message: "Only branch manager can view branch staff logs",
      });
    }

    const {
      actorId,
      action,
      level,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    // Lấy staff trong branch
    const staffInBranch = await UserBranch.find({
      branchId: managerBranchId,
      role: "staff",
    }).select("userId");

    const staffIds = staffInBranch.map((item) => item.userId);

    if (staffIds.length === 0) {
      return res.json({
        total: 0,
        page: pageNum,
        totalPages: 0,
        data: [],
      });
    }

    // Filter cơ bản
    const filter = {
      branchId: managerBranchId,
      actorId: { $in: staffIds },
    };

    // Filter actor
    if (actorId) {
      const isStaffInBranch = staffIds.some(
        (id) => String(id) === String(actorId)
      );

      if (!isStaffInBranch) {
        return res.status(403).json({
          message: "You are not allowed to view logs of this user",
        });
      }

      filter.actorId = new mongoose.Types.ObjectId(actorId);
    }

    // Filter action
    if (action) {
      filter.action = action;
    }

    // Filter level
    if (level) {
      filter.level = level;
    }

    // Filter thời gian
    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }

      if (toDate) {
        filter.createdAt.$lte = new Date(toDate);
      }
    }

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .populate({
          path: "actorId",
          select: "name email role phone",
        })
        .populate({
          path: "branchId",
          select: "name address",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Log.countDocuments(filter),
    ]);

    res.json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: logs,
    });
  } catch (error) {
    console.error("BRANCH STAFF LOG ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getBranchStaffLogDetails = async (req, res) => {
  try {
    const managerBranchId = req.user?.branchId;
    const managerBranchRole = req.user?.branchRole;
    const { id } = req.params;

    if (!managerBranchId) {
      return res.status(403).json({
        message: "Your account is not assigned to any branch",
      });
    }

    if (managerBranchRole !== "branch_manager") {
      return res.status(403).json({
        message: "Only branch manager can view branch staff logs",
      });
    }

    const staffInBranch = await UserBranch.find({
      branchId: managerBranchId,
      role: "staff",
    }).select("userId");

    const staffIds = staffInBranch.map((item) => String(item.userId));

    const log = await Log.findById(id)
      .populate("actorId", "name email role phone")
      .populate("branchId", "name address");

    if (!log) {
      return res.status(404).json({
        message: "Log not found",
      });
    }

    const logBranchId =
      typeof log.branchId === "object" ? log.branchId?._id : log.branchId;
    const logActorId =
      typeof log.actorId === "object" ? log.actorId?._id : log.actorId;

    const isCorrectBranch =
      String(logBranchId) === String(managerBranchId);
    const isStaffActor = staffIds.includes(String(logActorId));

    if (!isCorrectBranch || !isStaffActor) {
      return res.status(403).json({
        message: "You are not allowed to view this log",
      });
    }

    res.json({
      data: log,
    });
  } catch (error) {
    console.error("BRANCH STAFF LOG DETAIL ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
