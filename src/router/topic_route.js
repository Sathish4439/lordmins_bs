const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middle_ware/auth_middleware");
const { checkRole } = require("../middle_ware/role_middleware");
const {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  createSubTopic,
  getSubTopicById,
  updateSubTopic,
  deleteSubTopic,
  assignTopicsToCollege,
  getCollegeTopics,
} = require("../controller/topic_controller");

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Topic routes (accessible by all authenticated users)
router.get("/", getAllTopics);
router.get("/:topicId", getTopicById);
router.get("/college/:collegeId", getCollegeTopics);

// SubTopic routes (accessible by all authenticated users)
router.get("/subtopics/:subTopicId", getSubTopicById);

// Admin/Super Admin routes for creating and managing topics
router.post("/", checkRole("ADMIN", "SUPER_ADMIN"), createTopic);
router.put("/:topicId", checkRole("ADMIN", "SUPER_ADMIN"), updateTopic);
router.delete("/:topicId", checkRole("ADMIN", "SUPER_ADMIN"), deleteTopic);

// SubTopic management routes
router.post("/:topicId/subtopics", checkRole("ADMIN", "SUPER_ADMIN"), createSubTopic);
router.put("/subtopics/:subTopicId", checkRole("ADMIN", "SUPER_ADMIN"), updateSubTopic);
router.delete("/subtopics/:subTopicId", checkRole("ADMIN", "SUPER_ADMIN"), deleteSubTopic);

// College topic assignment
router.post("/assign-to-college", checkRole("ADMIN", "SUPER_ADMIN"), assignTopicsToCollege);

module.exports = router;
