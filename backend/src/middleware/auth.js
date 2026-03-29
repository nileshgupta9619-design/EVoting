import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../utils/helpers.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log("token", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const decoded = verifyToken(token);
    console.log("decoded", decoded);

    req.user = await User.findById(decoded.id);
    console.log("req.user",req.user);
    if (!req.user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with this id" });
    }
    // console.log("req.user",req.user);

    next();
  } catch (error) {
    console.log(error)
    res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "User role is not authorized to access this route",
      });
    }
    next();
  };
};
