const { prisma } = require("../prisma/prisma.js");
const { sendSuccess, sendError } = require("../utils/response");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

// 🔹 Generate Current Marks Report
async function generateCurrentMarksReport(req, res) {
  const { collegeId, classId, studentId } = req.query;
  const { userId } = req.user;

  try {
    const where = {
      ...(studentId && { studentId: parseInt(studentId) }),
      ...(collegeId && {
        student: {
          collegeId: parseInt(collegeId),
        },
      }),
      ...(classId && {
        student: {
          classId: parseInt(classId),
        },
      }),
    };

    const results = await prisma.assessmentResult.findMany({
      where,
      include: {
        assessment: {
          include: {
            subTopic: {
              include: {
                topic: true,
              },
            },
          },
        },
        student: {
          include: {
            college: true,
            class: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group results by student
    const studentMarks = {};
    results.forEach((result) => {
      const studentId = result.studentId;
      if (!studentMarks[studentId]) {
        studentMarks[studentId] = {
          student: result.student,
          assessments: [],
          totalScore: 0,
          totalAssessments: 0,
        };
      }
      studentMarks[studentId].assessments.push(result);
      studentMarks[studentId].totalScore += result.score;
      studentMarks[studentId].totalAssessments += 1;
    });

    // Calculate averages
    Object.values(studentMarks).forEach((student) => {
      student.averageScore =
        student.totalAssessments > 0
          ? (student.totalScore / student.totalAssessments).toFixed(2)
          : 0;
    });

    // Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Current Marks Report");

    // Add headers
    worksheet.columns = [
      { header: "Student Name", key: "studentName", width: 20 },
      { header: "Roll No", key: "rollNo", width: 15 },
      { header: "College", key: "college", width: 25 },
      { header: "Class", key: "class", width: 15 },
      { header: "Total Assessments", key: "totalAssessments", width: 18 },
      { header: "Average Score", key: "averageScore", width: 15 },
      { header: "Last Assessment Date", key: "lastAssessment", width: 20 },
    ];

    // Add data
    Object.values(studentMarks).forEach((student) => {
      const lastAssessment = student.assessments[0];
      worksheet.addRow({
        studentName: student.student.name,
        rollNo: student.student.rollNo,
        college: student.student.college?.name || "N/A",
        class: student.student.class?.name || "N/A",
        totalAssessments: student.totalAssessments,
        averageScore: student.averageScore,
        lastAssessment: lastAssessment
          ? lastAssessment.createdAt.toLocaleDateString()
          : "N/A",
      });
    });

    // Style the worksheet
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `current_marks_report_${timestamp}.xlsx`;
    const filepath = path.join(__dirname, "../../uploads/reports", filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save file
    await workbook.xlsx.writeFile(filepath);

    // Log report generation
    await prisma.report.create({
      data: {
        userId,
        reportType: "current_marks",
        collegeId: collegeId ? parseInt(collegeId) : null,
        classId: classId ? parseInt(classId) : null,
        studentId: studentId ? parseInt(studentId) : null,
        filePath: filepath,
        parameters: JSON.stringify({ collegeId, classId, studentId }),
      },
    });

    return sendSuccess(res, "Current marks report generated successfully", {
      filename,
      filepath,
      totalStudents: Object.keys(studentMarks).length,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to generate current marks report", 500);
  }
}

// 🔹 Generate Assignment Marks Report
async function generateAssignmentMarksReport(req, res) {
  const { collegeId, classId, assessmentId } = req.query;
  const { userId } = req.user;

  try {
    const where = {
      ...(assessmentId && { assessmentId: parseInt(assessmentId) }),
      ...(collegeId && {
        student: {
          collegeId: parseInt(collegeId),
        },
      }),
      ...(classId && {
        student: {
          classId: parseInt(classId),
        },
      }),
    };

    const results = await prisma.assessmentResult.findMany({
      where,
      include: {
        assessment: {
          include: {
            subTopic: {
              include: {
                topic: true,
              },
            },
          },
        },
        student: {
          include: {
            college: true,
            class: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assignment Marks Report");

    // Add headers
    worksheet.columns = [
      { header: "Student Name", key: "studentName", width: 20 },
      { header: "Roll No", key: "rollNo", width: 15 },
      { header: "College", key: "college", width: 25 },
      { header: "Class", key: "class", width: 15 },
      { header: "Assessment Title", key: "assessmentTitle", width: 30 },
      { header: "Topic", key: "topic", width: 25 },
      { header: "Sub-Topic", key: "subTopic", width: 25 },
      { header: "Score", key: "score", width: 10 },
      { header: "Total", key: "total", width: 10 },
      { header: "Percentage", key: "percentage", width: 12 },
      { header: "Passed", key: "passed", width: 10 },
      { header: "Time Spent (min)", key: "timeSpent", width: 15 },
      { header: "Attempt Number", key: "attemptNumber", width: 15 },
      { header: "Date", key: "date", width: 15 },
    ];

    // Add data
    results.forEach((result) => {
      worksheet.addRow({
        studentName: result.student.name,
        rollNo: result.student.rollNo,
        college: result.student.college?.name || "N/A",
        class: result.student.class?.name || "N/A",
        assessmentTitle: result.assessment.title,
        topic: result.assessment.subTopic?.topic?.title || "N/A",
        subTopic: result.assessment.subTopic?.title || "N/A",
        score: result.score,
        total: result.total,
        percentage: ((result.score / result.total) * 100).toFixed(2),
        passed: result.passed ? "Yes" : "No",
        timeSpent: Math.round(result.timeSpentSec / 60),
        attemptNumber: result.attemptNumber,
        date: result.createdAt.toLocaleDateString(),
      });
    });

    // Style the worksheet
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `assignment_marks_report_${timestamp}.xlsx`;
    const filepath = path.join(__dirname, "../../uploads/reports", filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save file
    await workbook.xlsx.writeFile(filepath);

    // Log report generation
    await prisma.report.create({
      data: {
        userId,
        reportType: "assignment_marks",
        collegeId: collegeId ? parseInt(collegeId) : null,
        classId: classId ? parseInt(classId) : null,
        filePath: filepath,
        parameters: JSON.stringify({ collegeId, classId, assessmentId }),
      },
    });

    return sendSuccess(res, "Assignment marks report generated successfully", {
      filename,
      filepath,
      totalRecords: results.length,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to generate assignment marks report", 500);
  }
}

// 🔹 Generate Total Duration Report
async function generateTotalDurationReport(req, res) {
  const { collegeId, classId, studentId, startDate, endDate } = req.query;
  const { userId } = req.user;

  try {
    const where = {
      ...(studentId && { studentId: parseInt(studentId) }),
      ...(collegeId && {
        student: {
          collegeId: parseInt(collegeId),
        },
      }),
      ...(classId && {
        student: {
          classId: parseInt(classId),
        },
      }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const results = await prisma.assessmentResult.findMany({
      where,
      include: {
        student: {
          include: {
            college: true,
            class: true,
          },
        },
      },
    });

    // Group by student and calculate total time
    const studentDuration = {};
    results.forEach((result) => {
      const studentId = result.studentId;
      if (!studentDuration[studentId]) {
        studentDuration[studentId] = {
          student: result.student,
          totalTimeSec: 0,
          totalAssessments: 0,
        };
      }
      studentDuration[studentId].totalTimeSec += result.timeSpentSec;
      studentDuration[studentId].totalAssessments += 1;
    });

    // Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Total Duration Report");

    // Add headers
    worksheet.columns = [
      { header: "Student Name", key: "studentName", width: 20 },
      { header: "Roll No", key: "rollNo", width: 15 },
      { header: "College", key: "college", width: 25 },
      { header: "Class", key: "class", width: 15 },
      { header: "Total Assessments", key: "totalAssessments", width: 18 },
      { header: "Total Time (hours)", key: "totalTimeHours", width: 18 },
      { header: "Total Time (minutes)", key: "totalTimeMinutes", width: 20 },
      {
        header: "Average Time per Assessment (min)",
        key: "avgTimePerAssessment",
        width: 30,
      },
    ];

    // Add data
    Object.values(studentDuration).forEach((student) => {
      const totalHours = Math.floor(student.totalTimeSec / 3600);
      const totalMinutes = Math.floor(student.totalTimeSec / 60);
      const avgTimePerAssessment =
        student.totalAssessments > 0
          ? Math.round(student.totalTimeSec / student.totalAssessments / 60)
          : 0;

      worksheet.addRow({
        studentName: student.student.name,
        rollNo: student.student.rollNo,
        college: student.student.college?.name || "N/A",
        class: student.student.class?.name || "N/A",
        totalAssessments: student.totalAssessments,
        totalTimeHours: totalHours,
        totalTimeMinutes: totalMinutes,
        avgTimePerAssessment: avgTimePerAssessment,
      });
    });

    // Style the worksheet
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `total_duration_report_${timestamp}.xlsx`;
    const filepath = path.join(__dirname, "../../uploads/reports", filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save file
    await workbook.xlsx.writeFile(filepath);

    // Log report generation
    await prisma.report.create({
      data: {
        userId,
        reportType: "total_duration",
        collegeId: collegeId ? parseInt(collegeId) : null,
        classId: classId ? parseInt(classId) : null,
        studentId: studentId ? parseInt(studentId) : null,
        filePath: filepath,
        parameters: JSON.stringify({
          collegeId,
          classId,
          studentId,
          startDate,
          endDate,
        }),
      },
    });

    return sendSuccess(res, "Total duration report generated successfully", {
      filename,
      filepath,
      totalStudents: Object.keys(studentDuration).length,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to generate total duration report", 500);
  }
}

// 🔹 Generate Overall Report
async function generateOverallReport(req, res) {
  const { collegeId, classId, studentId } = req.query;
  const { userId } = req.user;

  try {
    const where = {
      ...(studentId && { studentId: parseInt(studentId) }),
      ...(collegeId && {
        student: {
          collegeId: parseInt(collegeId),
        },
      }),
      ...(classId && {
        student: {
          classId: parseInt(classId),
        },
      }),
    };

    const results = await prisma.assessmentResult.findMany({
      where,
      include: {
        assessment: {
          include: {
            subTopic: {
              include: {
                topic: true,
              },
            },
          },
        },
        student: {
          include: {
            college: true,
            class: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by student and calculate comprehensive stats
    const studentStats = {};
    results.forEach((result) => {
      const studentId = result.studentId;
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          student: result.student,
          assessments: [],
          totalScore: 0,
          totalAssessments: 0,
          totalTimeSec: 0,
          passedAssessments: 0,
          topics: new Set(),
          subTopics: new Set(),
        };
      }
      studentStats[studentId].assessments.push(result);
      studentStats[studentId].totalScore += result.score;
      studentStats[studentId].totalAssessments += 1;
      studentStats[studentId].totalTimeSec += result.timeSpentSec;
      if (result.passed) studentStats[studentId].passedAssessments += 1;
      if (result.assessment.subTopic?.topic) {
        studentStats[studentId].topics.add(
          result.assessment.subTopic.topic.title
        );
      }
      if (result.assessment.subTopic) {
        studentStats[studentId].subTopics.add(result.assessment.subTopic.title);
      }
    });

    // Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Overall Report");

    // Add headers
    worksheet.columns = [
      { header: "Student Name", key: "studentName", width: 20 },
      { header: "Roll No", key: "rollNo", width: 15 },
      { header: "College", key: "college", width: 25 },
      { header: "Class", key: "class", width: 15 },
      { header: "Total Assessments", key: "totalAssessments", width: 18 },
      { header: "Passed Assessments", key: "passedAssessments", width: 20 },
      { header: "Pass Rate (%)", key: "passRate", width: 15 },
      { header: "Average Score", key: "averageScore", width: 15 },
      { header: "Total Time (hours)", key: "totalTimeHours", width: 18 },
      { header: "Topics Covered", key: "topicsCovered", width: 15 },
      { header: "Sub-Topics Covered", key: "subTopicsCovered", width: 18 },
      { header: "Last Activity", key: "lastActivity", width: 15 },
    ];

    // Add data
    Object.values(studentStats).forEach((student) => {
      const totalHours = Math.floor(student.totalTimeSec / 3600);
      const passRate =
        student.totalAssessments > 0
          ? (
              (student.passedAssessments / student.totalAssessments) *
              100
            ).toFixed(2)
          : 0;
      const averageScore =
        student.totalAssessments > 0
          ? (student.totalScore / student.totalAssessments).toFixed(2)
          : 0;
      const lastActivity =
        student.assessments[0]?.createdAt.toLocaleDateString() || "N/A";

      worksheet.addRow({
        studentName: student.student.name,
        rollNo: student.student.rollNo,
        college: student.student.college?.name || "N/A",
        class: student.student.class?.name || "N/A",
        totalAssessments: student.totalAssessments,
        passedAssessments: student.passedAssessments,
        passRate: passRate,
        averageScore: averageScore,
        totalTimeHours: totalHours,
        topicsCovered: student.topics.size,
        subTopicsCovered: student.subTopics.size,
        lastActivity: lastActivity,
      });
    });

    // Style the worksheet
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `overall_report_${timestamp}.xlsx`;
    const filepath = path.join(__dirname, "../../uploads/reports", filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save file
    await workbook.xlsx.writeFile(filepath);

    // Log report generation
    await prisma.report.create({
      data: {
        userId,
        reportType: "overall",
        collegeId: collegeId ? parseInt(collegeId) : null,
        classId: classId ? parseInt(classId) : null,
        studentId: studentId ? parseInt(studentId) : null,
        filePath: filepath,
        parameters: JSON.stringify({ collegeId, classId, studentId }),
      },
    });

    return sendSuccess(res, "Overall report generated successfully", {
      filename,
      filepath,
      totalStudents: Object.keys(studentStats).length,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to generate overall report", 500);
  }
}

// 🔹 Get Report History
async function getReportHistory(req, res) {
  const { userId } = req.user;
  const { reportType, collegeId, classId } = req.query;

  try {
    const where = {
      userId,
      ...(reportType && { reportType }),
      ...(collegeId && { collegeId: parseInt(collegeId) }),
      ...(classId && { classId: parseInt(classId) }),
    };

    const reports = await prisma.report.findMany({
      where,
      include: {
        college: true,
        class: true,
        student: true,
      },
      orderBy: { generatedAt: "desc" },
    });

    return sendSuccess(res, "Report history retrieved successfully", reports);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve report history", 500);
  }
}

// 🔹 Download Report File
async function downloadReport(req, res) {
  const { reportId } = req.params;
  const { userId } = req.user;

  try {
    const report = await prisma.report.findFirst({
      where: {
        id: parseInt(reportId),
        userId,
      },
    });

    if (!report) {
      return sendError(res, "Report not found", 404);
    }

    if (!report.filePath || !fs.existsSync(report.filePath)) {
      return sendError(res, "Report file not found", 404);
    }

    res.download(report.filePath, path.basename(report.filePath));
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to download report", 500);
  }
}

module.exports = {
  generateCurrentMarksReport,
  generateAssignmentMarksReport,
  generateTotalDurationReport,
  generateOverallReport,
  getReportHistory,
  downloadReport,
};
