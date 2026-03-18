const isManagerMiddleware = (req, res, next) => {
    if (!req.user.branchId) {
        return res.status(400).json({ message: "Branches context is missing" });
    }

    if (req.user.branchRole !== "branch_manager") {
        return res.status(403).json({
            message: "Only branch manager can access this resource",
        });
    }

    next();
};

export default isManagerMiddleware;