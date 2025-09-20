const express = require("express");
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  getQuestionsByTopic,
  getQuestionsBySubTopic,
} = require("../controllers/questionController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// ✅ Only Super Admin & Admin can create
router.post("/", authMiddleware, checkRole("SUPER_ADMIN", "ADMIN"), createQuestion);

// ✅ All logged-in users can view
router.get("/", authMiddleware, getAllQuestions);
router.get("/:id", authMiddleware, getQuestionById);
router.get("/topic/:topicId", authMiddleware, getQuestionsByTopic);
router.get("/subtopic/:subTopicId", authMiddleware, getQuestionsBySubTopic);

router.put("/:id", authMiddleware, checkRole("SUPER_ADMIN", "ADMIN"), updateQuestion);

router.delete("/:id", authMiddleware, checkRole("SUPER_ADMIN", "ADMIN"), deleteQuestion);


module.exports = router;
