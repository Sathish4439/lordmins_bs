const express = require("express");
const router = express.Router();
const collegeController = require("../controller/college_controller.js");
const { authMiddleware } = require("../middle_ware/auth_middleware.js");
const { checkRole } = require("../middle_ware/role_middleware.js");

router.post(
  "/",
  authMiddleware,
  checkRole("SUPER_ADMIN"),
  collegeController.createCollege
);

router.get("/", authMiddleware, collegeController.getColleges);
router.get("/:id", authMiddleware, collegeController.getCollege);

router.put(
  "/:id",
  authMiddleware,
  checkRole("SUPER_ADMIN"),
  collegeController.updateCollege
);

router.delete(
  "/:id",
  authMiddleware,
  checkRole("SUPER_ADMIN"),
  collegeController.deleteCollege
);

module.exports = router;
