const { prisma } = require("../prisma/prisma.js");
const { sendSuccess, sendError } = require("../utils/response");

// 🔹 Get All Colleges
async function getAllColleges(req, res) {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        classes: true,
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            status: true,
            lastLogin: true,
          },
        },
        _count: {
          select: {
            users: true,
            classes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, "Colleges retrieved successfully", colleges);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve colleges", 500);
  }
}

// 🔹 Get College Details
async function getCollegeDetails(req, res) {
  const { collegeId } = req.params;

  try {
    const college = await prisma.college.findUnique({
      where: { id: parseInt(collegeId) },
      include: {
        classes: {
          include: {
            users: {
              where: { role: "STUDENT" },
              select: {
                id: true,
                name: true,
                username: true,
                rollNo: true,
                status: true,
                lastLogin: true,
              },
            },
          },
        },
        users: {
          where: { role: { in: ["TEACHER", "ADMINISTRATIVE_ACCESS"] } },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            status: true,
            lastLogin: true,
          },
        },
        topics: {
          include: {
            topic: true,
          },
        },
        _count: {
          select: {
            users: true,
            classes: true,
          },
        },
      },
    });

    if (!college) {
      return sendError(res, "College not found", 404);
    }

    return sendSuccess(res, "College details retrieved successfully", college);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve college details", 500);
  }
}

// 🔹 Get All Students
async function getAllStudents(req, res) {
  const { collegeId, classId } = req.query;

  try {
    const where = {
      role: "STUDENT",
      ...(collegeId && { collegeId: parseInt(collegeId) }),
      ...(classId && { classId: parseInt(classId) }),
    };

    const students = await prisma.user.findMany({
      where,
      include: {
        college: true,
        class: true,
        student: true,
        assessmentResults: {
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
          },
          orderBy: { createdAt: "desc" },
        },
        studentProgress: {
          include: {
            subTopic: {
              include: {
                topic: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, "Students retrieved successfully", students);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve students", 500);
  }
}

// 🔹 Get All Topics
async function getAllTopics(req, res) {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        subTopics: {
          include: {
            assessment: true,
          },
        },
        collegeTopics: {
          include: {
            college: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return sendSuccess(res, "Topics retrieved successfully", topics);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve topics", 500);
  }
}

// 🔹 Create Assessment
async function createAssessment(req, res) {
  const {
    title,
    description,
    type,
    subTopicId,
    collegeId,
    classId,
    passingScore,
    timeLimit,
    questions,
  } = req.body;
  const { userId } = req.user;

  try {
    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        type,
        subTopicId: subTopicId || null,
        collegeId: collegeId || null,
        classId: classId || null,
        passingScore: passingScore || 60.0,
        timeLimit,
        createdById: userId,
        questions: {
          create: questions || [],
        },
      },
      include: {
        subTopic: {
          include: {
            topic: true,
          },
        },
        college: true,
        class: true,
        questions: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    return sendSuccess(res, "Assessment created successfully", assessment);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create assessment", 500);
  }
}

// 🔹 Get All Assessments
async function getAllAssessments(req, res) {
  const { collegeId, classId, type } = req.query;

  try {
    const where = {
      ...(collegeId && { collegeId: parseInt(collegeId) }),
      ...(classId && { classId: parseInt(classId) }),
      ...(type && { type }),
    };

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        subTopic: {
          include: {
            topic: true,
          },
        },
        college: true,
        class: true,
        questions: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, "Assessments retrieved successfully", assessments);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve assessments", 500);
  }
}

// 🔹 Get Assessment Results
async function getAssessmentResults(req, res) {
  const { assessmentId, collegeId, classId, studentId } = req.query;

  try {
    const where = {
      ...(assessmentId && { assessmentId: parseInt(assessmentId) }),
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

    return sendSuccess(res, "Assessment results retrieved successfully", results);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve assessment results", 500);
  }
}

// 🔹 Get Student Progress
async function getStudentProgress(req, res) {
  const { studentId, collegeId, classId } = req.query;

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

    const progress = await prisma.studentTopicProgress.findMany({
      where,
      include: {
        student: {
          include: {
            college: true,
            class: true,
          },
        },
        subTopic: {
          include: {
            topic: true,
            assessment: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, "Student progress retrieved successfully", progress);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve student progress", 500);
  }
}

// 🔹 Get Dashboard Data
async function getDashboardData(req, res) {
  try {
    const [
      totalColleges,
      totalStudents,
      totalTeachers,
      totalTopics,
      totalAssessments,
      recentStudents,
      recentAssessments,
    ] = await Promise.all([
      prisma.college.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.topic.count(),
      prisma.assessment.count(),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          college: true,
          class: true,
        },
      }),
      prisma.assessment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          college: true,
          class: true,
          createdBy: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      }),
    ]);

    return sendSuccess(res, "Dashboard data retrieved successfully", {
      stats: {
        totalColleges,
        totalStudents,
        totalTeachers,
        totalTopics,
        totalAssessments,
      },
      recentStudents,
      recentAssessments,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve dashboard data", 500);
  }
}

// 🔹 Generate Report
async function generateReport(req, res) {
  const { type, collegeId, classId, startDate, endDate } = req.query;

  try {
    let data = {};

    switch (type) {
      case "marks":
        data = await getMarksReport(collegeId, classId, startDate, endDate);
        break;
      case "assignment":
        data = await getAssignmentReport(collegeId, classId, startDate, endDate);
        break;
      case "duration":
        data = await getDurationReport(collegeId, classId, startDate, endDate);
        break;
      case "overall":
        data = await getOverallReport(collegeId, classId, startDate, endDate);
        break;
      default:
        return sendError(res, "Invalid report type", 400);
    }

    return sendSuccess(res, "Report generated successfully", data);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to generate report", 500);
  }
}

// Helper functions for reports
async function getMarksReport(collegeId, classId, startDate, endDate) {
  const where = {
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
    ...(startDate && endDate && {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  return await prisma.assessmentResult.findMany({
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
}

async function getAssignmentReport(collegeId, classId, startDate, endDate) {
  const where = {
    ...(collegeId && { collegeId: parseInt(collegeId) }),
    ...(classId && { classId: parseInt(classId) }),
    ...(startDate && endDate && {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  return await prisma.assessment.findMany({
    where,
    include: {
      college: true,
      class: true,
      createdBy: {
        select: {
          name: true,
          username: true,
        },
      },
      _count: {
        select: {
          results: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getDurationReport(collegeId, classId, startDate, endDate) {
  const where = {
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
    ...(startDate && endDate && {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  return await prisma.studentTopicProgress.findMany({
    where,
    include: {
      student: {
        include: {
          college: true,
          class: true,
        },
      },
      subTopic: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getOverallReport(collegeId, classId, startDate, endDate) {
  const where = {
    ...(collegeId && { collegeId: parseInt(collegeId) }),
    ...(classId && { classId: parseInt(classId) }),
  };

  const [students, assessments, results, progress] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        ...where,
      },
      include: {
        college: true,
        class: true,
      },
    }),
    prisma.assessment.findMany({
      where,
      include: {
        college: true,
        class: true,
      },
    }),
    prisma.assessmentResult.findMany({
      where: {
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
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
    }),
    prisma.studentTopicProgress.findMany({
      where: {
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
      },
    }),
  ]);

  return {
    students,
    assessments,
    results,
    progress,
  };
}

module.exports = {
  getAllColleges,
  getCollegeDetails,
  getAllStudents,
  getAllTopics,
  createAssessment,
  getAllAssessments,
  getAssessmentResults,
  getStudentProgress,
  getDashboardData,
  generateReport,
};
