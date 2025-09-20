const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middle_ware/auth_middleware");
const { checkRole } = require("../middle_ware/role_middleware");
const {
  getAllColleges,
  createCollege,
  updateCollege,
  deleteCollege,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllTopics,
  createTopic,
  assignTopicsToCollege,
  getDashboardData,
} = require("../controller/super_admin_controller");

// Apply authentication and role middleware to all routes
router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN"));

// College routes
router.get("/colleges", getAllColleges);
router.post("/colleges", createCollege);
router.put("/colleges/:id", updateCollege);
router.delete("/colleges/:id", deleteCollege);

// User routes
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Topic routes
router.get("/topics", getAllTopics);
router.post("/topics", createTopic);
router.post("/topics/assign-to-college", assignTopicsToCollege);

// Dashboard
router.get("/dashboard", getDashboardData);

module.exports = router;
