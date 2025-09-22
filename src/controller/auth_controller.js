const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const prisma = require("../prisma/prisma.js");
const { sendSuccess, sendError } = require("../utils/response");

dotenv.config();
const SECRET = process.env.JWT_SECRET;

// 🔹 Signup Controller
async function signup(req, res) {
  const { 
    username, 
    password, 
    role, 
    name, 
    email, 
    collegeId, 
    classId, 
    rollNo, 
    dob 
  } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    // Validate required fields based on role
    if (role === "STUDENT" && (!collegeId || !classId || !rollNo)) {
      return sendError(res, "College, class, and roll number are required for students", 400);
    }

    if ((role === "TEACHER" || role === "ADMINISTRATIVE_ACCESS") && !collegeId) {
      return sendError(res, "College is required for teachers and administrative access", 400);
    }

    // Create user data object
    const userData = {
      username,
      passwordHash: hashed,
      role,
      name,
      email,
      collegeId: collegeId || null,
      classId: classId || null,
      rollNo: rollNo || null,
      dob: dob ? new Date(dob) : null,
    };

    // Add role-specific data
    if (role === "SUPER_ADMIN") {
      userData.superAdmin = { create: {} };
    } else if (role === "ADMIN") {
      userData.admin = { create: {} };
    } else if (role === "ADMINISTRATIVE_ACCESS") {
      userData.administrativeAccess = { create: { collegeId } };
    } else if (role === "TEACHER") {
      userData.teacher = { create: { collegeId } };
    } else if (role === "STUDENT") {
      userData.student = { create: { collegeId, classId, rollNo } };
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        college: true,
        class: true,
        superAdmin: true,
        admin: true,
        administrativeAccess: true,
        teacher: true,
        student: true,
      },
    });

    return sendSuccess(res, "User created successfully", {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status,
      college: user.college,
      class: user.class,
    });
  } catch (err) {
    console.error(err);
    if (err.code === "P2002") {
      return sendError(res, "Username or email already exists", 400);
    }
    return sendError(res, "User creation failed", 400);
  }
}

// 🔹 Login Controller
async function login(req, res) {
  const { username, password } = req.body;

  console.log(req.body);
  

  try {
    const user = await prisma. prisma.user.findUnique({
      where: { username },
      include: {
        college: true,
        class: true,
        superAdmin: true,
        admin: true,
        administrativeAccess: true,
        teacher: true,
        student: true,
      },
    });

    if (!user) return sendError(res, "User not found", 404);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return sendError(res, "Invalid password", 400);

    // Update last login
    await prisma. prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        username: user.username,
        collegeId: user.collegeId,
        classId: user.classId
      },
      SECRET,
      { expiresIn: "1d" }
    );

    return sendSuccess(res, "Login successful", {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isFirstTimeLogin: user.isFirstTimeLogin,
        college: user.college,
        class: user.class,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Something went wrong", 500);
  }
}

// 🔹 Confirm First Time Login
async function confirmFirstTimeLogin(req, res) {
  const { userId } = req.user;

  try {
    const user = await prisma. prisma.user.update({
      where: { id: userId },
      data: { 
        isFirstTimeLogin: false,
        status: "ACTIVE"
      },
    });

    return sendSuccess(res, "First time login confirmed", {
      isFirstTimeLogin: user.isFirstTimeLogin,
      status: user.status,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to confirm first time login", 500);
  }
}

// 🔹 Refresh Token
async function refreshToken(req, res) {
  const { refreshToken } = req.body;

  try {
    // Verify refresh token and generate new access token
    const decoded = jwt.verify(refreshToken, SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) return sendError(res, "Invalid refresh token", 401);

    const newToken = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        username: user.username,
        collegeId: user.collegeId,
        classId: user.classId
      },
      SECRET,
      { expiresIn: "1d" }
    );

    return sendSuccess(res, "Token refreshed", { token: newToken });
  } catch (err) {
    console.error(err);
    return sendError(res, "Invalid refresh token", 401);
  }
}

module.exports = { signup, login, confirmFirstTimeLogin, refreshToken };
