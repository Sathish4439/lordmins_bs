const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middle_ware/auth_middleware");
const { checkRole } = require("../middle_ware/role_middleware");
const {
  getProfile,
  getCollegeDetails,
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getDashboardData,
} = require("../controller/administrative_controller");

// Apply authentication and role middleware to all routes
router.use(authMiddleware);
router.use(checkRole("ADMINISTRATIVE_ACCESS"));

// Profile routes
router.get("/profile", getProfile);

// College routes
router.get("/college", getCollegeDetails);

// Class routes
router.get("/classes", getAllClasses);
router.post("/classes", createClass);
router.put("/classes/:classId", updateClass);
router.delete("/classes/:classId", deleteClass);

// Student routes
router.get("/students", getAllStudents);
router.post("/students", createStudent);
router.put("/students/:studentId", updateStudent);
router.delete("/students/:studentId", deleteStudent);

// Teacher routes
router.get("/teachers", getAllTeachers);
router.post("/teachers", createTeacher);
router.put("/teachers/:teacherId", updateTeacher);
router.delete("/teachers/:teacherId", deleteTeacher);

// Dashboard
router.get("/dashboard", getDashboardData);

module.exports = router;
