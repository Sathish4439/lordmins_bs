const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middle_ware/auth_middleware");
const { checkRole } = require("../middle_ware/role_middleware");
const {
  getProfile,
  getAvailableTopics,
  getTopicDetails,
  getSubTopicDetails,
  takeInitialAssessment,
  takeAssessment,
  getAssessmentResults,
  getStudentProgress,
  getDashboardData,
} = require("../controller/student_controller");

// Apply authentication and role middleware to all routes
router.use(authMiddleware);
router.use(checkRole("STUDENT"));

// Profile routes
router.get("/profile", getProfile);

// Topic routes
router.get("/topics", getAvailableTopics);
router.get("/topics/:topicId", getTopicDetails);
router.get("/subtopics/:subTopicId", getSubTopicDetails);

// Assessment routes
router.post("/initial-assessment", takeInitialAssessment);
router.post("/assessments/:assessmentId/submit", takeAssessment);
router.get("/assessments/results", getAssessmentResults);

// Progress routes
router.get("/progress", getStudentProgress);

// Dashboard
router.get("/dashboard", getDashboardData);

module.exports = router;
