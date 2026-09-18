import jwt from "jsonwebtoken";

const getTokenPayload = (
    user
) => {

    if (
        user &&
        user._id
    ) {

        return {
            userId: user._id.toString(),
            role: user.role || "user"
        };
    }

    return {
        userId: user,
        role: "user"
    };
};

const generateAccessToken = (user) => {
    return jwt.sign({
            ...getTokenPayload(
                user
            )
        },
        process.env.JWT_SECRET, {
            expiresIn: "15m"
        }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign({
            ...getTokenPayload(
                user
            )
        },
        process.env.JWT_SECRET, {
            expiresIn: "7d"
        }
    );
};

export {
    generateAccessToken,
    generateRefreshToken
};
