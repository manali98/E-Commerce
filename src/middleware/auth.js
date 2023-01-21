const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

//for authorization
const authMiddleware = async (req, res, next) => {
  if (req.userData.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied! User is not an admin!!",
    });
  }
};

//for authentication
const generateToken = async (reqData) => {
  try {
    const token = await jwt.sign(
      {
        reqData: reqData,
        role: reqData.role,
      },
      process.env.SECRET_KEY
    );

    return token;
  } catch (err) {
    res.status(406).send({ message: err.message });
  }
};

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) throw new Error("No token provided");

    const id = jwt.verify(token, process.env.SECRET_KEY);

    req.body = {
      ...req.body,
      id,
    };

    return next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

module.exports = { authMiddleware, generateToken, verifyToken };
