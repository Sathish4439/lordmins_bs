const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prisma.js");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // ✅ fetch user with relations that actually exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        college: true,
        class: true,
        assessmentResults: true,
        studentProgress: true,
        refreshTokens: true,
        createdTopics: true,
        createdAssessments: true,
        superAdmin: true,
        admin: true,
        administrativeAccess: true,
        teacher: true,
        student: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.role = user.role; // role is an enum in your schema
    next();
  } catch (error) {
    console.error("AuthMiddleware Error:", error.message);
    return res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};

module.exports = { authMiddleware };
