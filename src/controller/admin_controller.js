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

// 🔹 Get All Departments
async function getAllDepartments(req, res) {
  try {
    const departments = await prisma.department.findMany({
      include: {
        college: true,
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

    return sendSuccess(res, "Departments retrieved successfully", departments);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve departments", 500);
  }
}

// 🔹 Get All Timesheets
async function getAllTimesheets(req, res) {
  try {
    const { collegeId, classId, startDate, endDate } = req.query;
    
    let whereClause = {};
    
    if (collegeId) {
      whereClause.user = {
        collegeId: parseInt(collegeId),
      };
    }
    
    if (classId) {
      whereClause.user = {
        ...whereClause.user,
        classId: parseInt(classId),
      };
    }
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            college: true,
            class: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return sendSuccess(res, "Timesheets retrieved successfully", timesheets);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve timesheets", 500);
  }
}

// 🔹 Get All Classes
async function getAllClasses(req, res) {
  try {
    const { collegeId } = req.query;
    
    let whereClause = {};
    if (collegeId) {
      whereClause.collegeId = parseInt(collegeId);
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        college: true,
        department: true,
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, "Classes retrieved successfully", classes);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve classes", 500);
  }
}

// 🔹 Create College
async function createCollege(req, res) {
  try {
    const { name, location } = req.body;

    if (!name) {
      return sendError(res, "College name is required", 400);
    }

    const college = await prisma.college.create({
      data: {
        name,
        location: location || null,
      },
      include: {
        classes: true,
        users: true,
        _count: {
          select: {
            users: true,
            classes: true,
          },
        },
      },
    });

    return sendSuccess(res, "College created successfully", college, 201);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create college", 500);
  }
}

// 🔹 Create Class
async function createClass(req, res) {
  try {
    const { name, collegeId, departmentId } = req.body;

    if (!name || !collegeId) {
      return sendError(res, "Class name and college ID are required", 400);
    }

    const classModel = await prisma.class.create({
      data: {
        name,
        collegeId: parseInt(collegeId),
        departmentId: departmentId ? parseInt(departmentId) : null,
      },
      include: {
        college: true,
        department: true,
        users: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return sendSuccess(res, "Class created successfully", classModel, 201);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create class", 500);
  }
}

// 🔹 Create Student
async function createStudent(req, res) {
  try {
    const { name, username, password, collegeId, classId, departmentId, rollNo, dob } = req.body;

    if (!name || !username || !password || !collegeId || !classId || !rollNo) {
      return sendError(res, "Name, username, password, college ID, class ID, and roll number are required", 400);
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return sendError(res, "Username already exists", 400);
    }

    const bcrypt = require("bcrypt");
    const passwordHash = await bcrypt.hash(password, 10);

    const student = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash,
        role: "STUDENT",
        status: "ACTIVE",
        collegeId: parseInt(collegeId),
        classId: parseInt(classId),
        departmentId: departmentId ? parseInt(departmentId) : null,
        rollNo,
        dob: dob ? new Date(dob) : null,
        isFirstTimeLogin: true,
      },
      include: {
        college: true,
        class: true,
        department: true,
      },
    });

    return sendSuccess(res, "Student created successfully", student, 201);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create student", 500);
  }
}

// 🔹 Create Teacher
async function createTeacher(req, res) {
  try {
    const { name, username, password, collegeId, departmentId } = req.body;

    if (!name || !username || !password || !collegeId) {
      return sendError(res, "Name, username, password, and college ID are required", 400);
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return sendError(res, "Username already exists", 400);
    }

    const bcrypt = require("bcrypt");
    const passwordHash = await bcrypt.hash(password, 10);

    const teacher = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash,
        role: "TEACHER",
        status: "ACTIVE",
        collegeId: parseInt(collegeId),
        departmentId: departmentId ? parseInt(departmentId) : null,
        isFirstTimeLogin: true,
      },
      include: {
        college: true,
        department: true,
      },
    });

    return sendSuccess(res, "Teacher created successfully", teacher, 201);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create teacher", 500);
  }
}

// 🔹 Assign Topics to College
async function assignTopicsToCollege(req, res) {
  try {
    const { collegeId, topicIds } = req.body;

    if (!collegeId || !topicIds || !Array.isArray(topicIds)) {
      return sendError(res, "College ID and topic IDs array are required", 400);
    }

    // Remove existing assignments for this college
    await prisma.collegeTopic.deleteMany({
      where: { collegeId: parseInt(collegeId) },
    });

    // Create new assignments
    const assignments = await prisma.collegeTopic.createMany({
      data: topicIds.map(topicId => ({
        collegeId: parseInt(collegeId),
        topicId: parseInt(topicId),
      })),
    });

    return sendSuccess(res, "Topics assigned to college successfully", { assignments });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to assign topics to college", 500);
  }
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
  getAllDepartments,
  getAllTimesheets,
  getAllClasses,
  createCollege,
  createClass,
  createStudent,
  createTeacher,
  assignTopicsToCollege,
};
