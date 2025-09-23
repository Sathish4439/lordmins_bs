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
  getAllDepartments,
  getAllTimesheets,
  getAllClasses,
  createCollege,
  createClass,
  createStudent,
  createTeacher,
  assignTopicsToCollege,
} = require("../controller/admin_controller");

// Apply authentication and role middleware to all routes
router.use(authMiddleware);
router.use(checkRole("ADMIN"));

// College routes
router.get("/colleges", getAllColleges);
router.get("/colleges/:collegeId", getCollegeDetails);
router.post("/colleges", createCollege);

// Department routes
router.get("/departments", getAllDepartments);

// Class routes
router.get("/classes", getAllClasses);
router.post("/classes", createClass);

// Student routes
router.get("/students", getAllStudents);
router.post("/students", createStudent);

// Teacher routes
router.post("/teachers", createTeacher);

// Topic routes
router.get("/topics", getAllTopics);
router.post("/topics/assign-to-college", assignTopicsToCollege);

// Assessment routes
router.get("/assessments", getAllAssessments);
router.post("/assessments", createAssessment);
router.get("/assessments/results", getAssessmentResults);

// Progress routes
router.get("/progress", getStudentProgress);

// Timesheet routes
router.get("/timesheets", getAllTimesheets);

// Dashboard
router.get("/dashboard", getDashboardData);

// Report routes
router.get("/reports", generateReport);

module.exports = router;
