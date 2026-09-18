import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authMiddleware = async(
    req,
    res,
    next
) => {

    try {

        const authHeader =
            req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message: "Access token is required"

            });
        }


        const parts =
            authHeader.split(" ");


        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {

            return res.status(401).json({

                success: false,

                message: "Invalid authorization format"

            });
        }


        const token =
            parts[1];


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        const user = await User.findById(
            decoded.userId
        ).select("isActive");


        if (!user || !user.isActive) {

            return res.status(403).json({

                success: false,

                message: "Your account has been suspended. Please contact support."

            });
        }


        req.user =
            decoded;


        next();

    } catch {

        return res.status(401).json({

            success: false,

            message: "Invalid or expired access token"

        });
    }
};

export default authMiddleware;
