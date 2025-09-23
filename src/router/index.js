const express = require("express");

const route = express.Router();
const authRoute = require("./auth_route");
const profileRoute = require("./profile_route");
const collegeRouter = require("./college_route");
const superAdminRoute = require("./super_admin_route");
const adminRoute = require("./admin_route");
const teacherRoute = require("./teacher_route");
const studentRoute = require("./student_route");
const administrativeRoute = require("./administrative_route");
const assessmentRoute = require("./assessment_route");
const topicRoute = require("./topic_route");
const reportRoute = require("./report_route");

// Public routes
route.use("/auth", authRoute);

// Protected routes
route.use("/profile", profileRoute);
route.use("/colleges", collegeRouter);
route.use("/super-admin", superAdminRoute);
route.use("/admin", adminRoute);
route.use("/teacher", teacherRoute);
route.use("/student", studentRoute);
route.use("/administrative", administrativeRoute);
route.use("/assessments", assessmentRoute);
route.use("/topics", topicRoute);
route.use("/reports", reportRoute);

module.exports = route;
