const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middle_ware/auth_middleware");
const { checkRole } = require("../middle_ware/role_middleware");
const {
  getProfile,
  getAllColleges,
  getCollegeDetails,
  getAllStudents,
  getAllTopics,
  getAllAssessments,
  getAssessmentResults,
  getStudentProgress,
  getDashboardData,
  generateReport,
} = require("../controller/teacher_controller");

// Apply authentication and role middleware to all routes
router.use(authMiddleware);
router.use(checkRole("TEACHER"));

// Profile routes
router.get("/profile", getProfile);

// College routes
router.get("/colleges", getAllColleges);
router.get("/colleges/:collegeId", getCollegeDetails);

// Student routes
router.get("/students", getAllStudents);

// Topic routes
router.get("/topics", getAllTopics);

// Assessment routes
router.get("/assessments", getAllAssessments);
router.get("/assessments/results", getAssessmentResults);

// Progress routes
router.get("/progress", getStudentProgress);

// Dashboard
router.get("/dashboard", getDashboardData);

// Report routes
router.get("/reports", generateReport);

module.exports = router;
