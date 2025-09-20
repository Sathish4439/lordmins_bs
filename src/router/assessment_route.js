const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middle_ware/auth_middleware");
const { checkRole } = require("../middle_ware/role_middleware");
const {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  addQuestions,
  updateQuestion,
  deleteQuestion,
  getAssessmentResults,
  getStudentAssessmentResults,
  submitAssessment,
  getAssessmentStatistics,
} = require("../controller/assessment_controller");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Assessment routes (accessible by all authenticated users)
router.get("/", getAllAssessments);
router.get("/:assessmentId", getAssessmentById);
router.get("/:assessmentId/results", getAssessmentResults);
router.get("/:assessmentId/statistics", getAssessmentStatistics);
router.post("/:assessmentId/submit", checkRole("STUDENT"), submitAssessment);
router.get("/student/:studentId/results", getStudentAssessmentResults);

// Admin/Teacher routes for creating and managing assessments
router.post("/", checkRole("ADMIN", "SUPER_ADMIN"), createAssessment);
router.put("/:assessmentId", checkRole("ADMIN", "SUPER_ADMIN"), updateAssessment);
router.delete("/:assessmentId", checkRole("ADMIN", "SUPER_ADMIN"), deleteAssessment);

// Question management routes
router.post("/:assessmentId/questions", checkRole("ADMIN", "SUPER_ADMIN"), addQuestions);
router.put("/questions/:questionId", checkRole("ADMIN", "SUPER_ADMIN"), updateQuestion);
router.delete("/questions/:questionId", checkRole("ADMIN", "SUPER_ADMIN"), deleteQuestion);

module.exports = router;
