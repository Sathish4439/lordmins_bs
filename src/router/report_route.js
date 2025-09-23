const express = require("express");
const router = express.Router();
const reportController = require("../controller/report_controller");
const { authMiddleware } = require("../middle_ware/auth_middleware");

// Generate Current Marks Report
router.get(
  "/current-marks",
  authMiddleware,
  reportController.generateCurrentMarksReport
);

// Generate Assignment Marks Report
router.get(
  "/assignment-marks",
  authMiddleware,
  reportController.generateAssignmentMarksReport
);

// Generate Total Duration Report
router.get(
  "/total-duration",
  authMiddleware,
  reportController.generateTotalDurationReport
);

// Generate Overall Report
router.get(
  "/overall",
  authMiddleware,
  reportController.generateOverallReport
);

// Get Report History
router.get("/history", authMiddleware, reportController.getReportHistory);

// Download Report File
router.get(
  "/download/:reportId",
  authMiddleware,
  reportController.downloadReport
);

module.exports = router;
