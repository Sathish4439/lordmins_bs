const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middle_ware/auth_middleware");
const { checkRole } = require("../middle_ware/role_middleware");
const {
  getAllColleges,
  getClassesByCollegeId,
  createCollege,
  updateCollege,
  deleteCollege,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  assignTopicsToCollege,
  getAllSubTopics,
  createSubTopic,
  updateSubTopic,
  deleteSubTopic,
  getAllAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getAllReports,
  downloadReport,
  getDashboardData,
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllStudents,
  getStudentsByClass,
  getStudentsByCollege,
  getStudentsByDepartment,
  getStudentStatistics,
} = require("../controller/super_admin_controller");

// Apply authentication and role middleware to all routes
router.use(authMiddleware);
router.use(checkRole("SUPER_ADMIN"));

// College routes
router.get("/colleges", getAllColleges);
router.get("/colleges/:collegeId/classes", getClassesByCollegeId);
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
router.put("/topics/:id", updateTopic);
router.delete("/topics/:id", deleteTopic);
router.post("/topics/assign-to-college", assignTopicsToCollege);

// Sub-Topic routes
router.get("/sub-topics", getAllSubTopics);
router.post("/sub-topics", createSubTopic);
router.put("/sub-topics/:id", updateSubTopic);
router.delete("/sub-topics/:id", deleteSubTopic);

// Assessment routes
router.get("/assessments", getAllAssessments);
router.post("/assessments", createAssessment);
router.put("/assessments/:id", updateAssessment);
router.delete("/assessments/:id", deleteAssessment);

// Class routes
router.get("/classes", getAllClasses);
router.post("/classes", createClass);
router.put("/classes/:id", updateClass);
router.delete("/classes/:id", deleteClass);

// Department routes
router.get("/departments", getAllDepartments);
router.post("/departments", createDepartment);
router.put("/departments/:id", updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// Student routes
router.get("/students", getAllStudents);
router.get("/students/class/:classId", getStudentsByClass);
router.get("/students/college/:collegeId", getStudentsByCollege);
router.get("/students/department/:departmentId", getStudentsByDepartment);
router.get("/students/statistics", getStudentStatistics);

// Report routes
router.get("/reports", getAllReports);
router.get("/reports/download/:reportId", downloadReport);

// Dashboard
router.get("/dashboard", getDashboardData);

module.exports = router;
