const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middle_ware/auth_middleware");
const { checkRole } = require("../middle_ware/role_middleware");
const {
  getAllColleges,
  getCollegeDetails,
  getAllStudents,
  getAllTopics,
  createAssessment,
  getAllAssessments,
  getAssessmentResults,
  getStudentProgress,
  getDashboardData,
  generateReport,
} = require("../controller/admin_controller");

// Apply authentication and role middleware to all routes
router.use(authMiddleware);
router.use(checkRole("ADMIN"));

// College routes
router.get("/colleges", getAllColleges);
router.get("/colleges/:collegeId", getCollegeDetails);

// Student routes
router.get("/students", getAllStudents);

// Topic routes
router.get("/topics", getAllTopics);

// Assessment routes
router.get("/assessments", getAllAssessments);
router.post("/assessments", createAssessment);
router.get("/assessments/results", getAssessmentResults);

// Progress routes
router.get("/progress", getStudentProgress);

// Dashboard
router.get("/dashboard", getDashboardData);

// Report routes
router.get("/reports", generateReport);

module.exports = router;
