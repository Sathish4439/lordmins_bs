const { prisma } = require("../prisma/prisma");
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

// 🔹 Get Classes by College ID
async function getClassesByCollegeId(req, res) {
  const { collegeId } = req.params;

  try {
    const classes = await prisma.class.findMany({
      where: { collegeId: parseInt(collegeId) },
      include: {
        college: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
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
    return sendError(res, "Failed to retrieve classes", 400);
  }
}

// 🔹 Create College
async function createCollege(req, res) {
  const { name, location } = req.body;

  try {
    const college = await prisma.college.create({
      data: { name, location },
      include: {
        classes: true,
        _count: {
          select: {
            users: true,
            classes: true,
          },
        },
      },
    });

    return sendSuccess(res, "College created successfully", college);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create college", 500);
  }
}

// 🔹 Update College
async function updateCollege(req, res) {
  const { id } = req.params;
  const { name, location } = req.body;

  try {
    const college = await prisma.college.update({
      where: { id: parseInt(id) },
      data: { name, location },
      include: {
        classes: true,
        _count: {
          select: {
            users: true,
            classes: true,
          },
        },
      },
    });

    return sendSuccess(res, "College updated successfully", college);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update college", 500);
  }
}

// 🔹 Delete College
async function deleteCollege(req, res) {
  const { id } = req.params;

  try {
    await prisma.college.delete({
      where: { id: parseInt(id) },
    });

    return sendSuccess(res, "College deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete college", 500);
  }
}

// 🔹 Get All Users
async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: {
        college: true,
        class: true,
        superAdmin: true,
        admin: true,
        administrativeAccess: true,
        teacher: true,
        student: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, "Users retrieved successfully", users);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve users", 500);
  }
}

// 🔹 Create User
async function createUser(req, res) {
  const {
    username,
    password,
    role,
    name,
    email,
    collegeId,
    classId,
    rollNo,
    dob,
  } = req.body;

  try {
    const bcrypt = require("bcrypt");
    const hashed = await bcrypt.hash(password, 10);

    const userData = {
      username,
      passwordHash: hashed,
      role,
      name,
      email,
      collegeId: collegeId || null,
      classId: classId || null,
      rollNo: rollNo || null,
      dob: dob ? new Date(dob) : null,
    };

    // Add role-specific data
    if (role === "SUPER_ADMIN") {
      userData.superAdmin = { create: {} };
    } else if (role === "ADMIN") {
      userData.admin = { create: {} };
    } else if (role === "ADMINISTRATIVE_ACCESS") {
      userData.administrativeAccess = { create: { collegeId } };
    } else if (role === "TEACHER") {
      userData.teacher = { create: { collegeId } };
    } else if (role === "STUDENT") {
      userData.student = { create: { collegeId, classId, rollNo } };
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        college: true,
        class: true,
        superAdmin: true,
        admin: true,
        administrativeAccess: true,
        teacher: true,
        student: true,
      },
    });

    return sendSuccess(res, "User created successfully", user);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002") {
      return sendError(res, "Username or email already exists", 400);
    }
    return sendError(res, "Failed to create user", 500);
  }
}

// 🔹 Update User
async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, status, collegeId, classId, rollNo } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        status,
        collegeId,
        classId,
        rollNo,
      },
      include: {
        college: true,
        class: true,
        superAdmin: true,
        admin: true,
        administrativeAccess: true,
        teacher: true,
        student: true,
      },
    });

    return sendSuccess(res, "User updated successfully", user);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update user", 500);
  }
}

// 🔹 Delete User
async function deleteUser(req, res) {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return sendSuccess(res, "User deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete user", 500);
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

// 🔹 Create Topic
async function createTopic(req, res) {
  const { title, description, order } = req.body;
  const { userId } = req.user;

  try {
    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        order: order || 0,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        subTopics: true,
        collegeTopics: true,
      },
    });

    return sendSuccess(res, "Topic created successfully", topic);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create topic", 500);
  }
}

// 🔹 Update Topic
async function updateTopic(req, res) {
  const { id } = req.params;
  const { title, description, order } = req.body;

  try {
    const topic = await prisma.topic.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        order: order || 0,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        subTopics: true,
        collegeTopics: true,
      },
    });

    return sendSuccess(res, "Topic updated successfully", topic);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update topic", 500);
  }
}

// 🔹 Delete Topic
async function deleteTopic(req, res) {
  const { id } = req.params;

  try {
    await prisma.topic.delete({
      where: { id: parseInt(id) },
    });

    return sendSuccess(res, "Topic deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete topic", 500);
  }
}

// 🔹 Get All Sub-Topics
async function getAllSubTopics(req, res) {
  try {
    const subTopics = await prisma.subTopic.findMany({
      include: {
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
        assessment: true,
        videoFile: true,
        progress: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return sendSuccess(res, "Sub-topics retrieved successfully", subTopics);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve sub-topics", 500);
  }
}

// 🔹 Create Sub-Topic
async function createSubTopic(req, res) {
  const { title, description, topicId, videoFileId, imageFileIds, order } =
    req.body;

  try {
    const subTopic = await prisma.subTopic.create({
      data: {
        title,
        description,
        topicId: parseInt(topicId),
        videoFileId: videoFileId ? parseInt(videoFileId) : null,
        imageFileIds: imageFileIds ? JSON.stringify(imageFileIds) : null,
        order: order || 0,
      },
      include: {
        topic: true,
        assessment: true,
        videoFile: true,
      },
    });

    return sendSuccess(res, "Sub-topic created successfully", subTopic);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create sub-topic", 500);
  }
}

// 🔹 Update Sub-Topic
async function updateSubTopic(req, res) {
  const { id } = req.params;
  const { title, description, videoFileId, imageFileIds, order } = req.body;

  try {
    const subTopic = await prisma.subTopic.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        videoFileId: videoFileId ? parseInt(videoFileId) : null,
        imageFileIds: imageFileIds ? JSON.stringify(imageFileIds) : null,
        order: order || 0,
      },
      include: {
        topic: true,
        assessment: true,
        videoFile: true,
      },
    });

    return sendSuccess(res, "Sub-topic updated successfully", subTopic);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update sub-topic", 500);
  }
}

// 🔹 Delete Sub-Topic
async function deleteSubTopic(req, res) {
  const { id } = req.params;

  try {
    await prisma.subTopic.delete({
      where: { id: parseInt(id) },
    });

    return sendSuccess(res, "Sub-topic deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete sub-topic", 500);
  }
}

// 🔹 Get All Assessments
async function getAllAssessments(req, res) {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        subTopic: {
          include: {
            topic: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        questions: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        results: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
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
    pdfFileId,
  } = req.body;
  const { userId } = req.user;

  try {
    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        type,
        subTopicId: subTopicId ? parseInt(subTopicId) : null,
        collegeId: collegeId ? parseInt(collegeId) : null,
        classId: classId ? parseInt(classId) : null,
        passingScore: passingScore || 60.0,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        pdfFileId: pdfFileId ? parseInt(pdfFileId) : null,
        createdById: userId,
      },
      include: {
        subTopic: {
          include: {
            topic: true,
          },
        },
        questions: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        college: true,
        class: true,
      },
    });

    return sendSuccess(res, "Assessment created successfully", assessment);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create assessment", 500);
  }
}

// 🔹 Update Assessment
async function updateAssessment(req, res) {
  const { id } = req.params;
  const { title, description, type, passingScore, timeLimit, pdfFileId } =
    req.body;

  try {
    const assessment = await prisma.assessment.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        type,
        passingScore: passingScore || 60.0,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        pdfFileId: pdfFileId ? parseInt(pdfFileId) : null,
      },
      include: {
        subTopic: {
          include: {
            topic: true,
          },
        },
        questions: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        college: true,
        class: true,
      },
    });

    return sendSuccess(res, "Assessment updated successfully", assessment);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update assessment", 500);
  }
}

// 🔹 Delete Assessment
async function deleteAssessment(req, res) {
  const { id } = req.params;

  try {
    await prisma.assessment.delete({
      where: { id: parseInt(id) },
    });

    return sendSuccess(res, "Assessment deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete assessment", 500);
  }
}

// 🔹 Get All Classes
async function getAllClasses(req, res) {
  try {
    console.log("🔍 getAllClasses called");
    const classes = await prisma.class.findMany({
      include: {
        college: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            username: true,
            rollNo: true,
            role: true,
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

    console.log(`✅ Found ${classes.length} classes`);
    return sendSuccess(res, "Classes retrieved successfully", classes);
  } catch (err) {
    console.error("❌ Error in getAllClasses:", err);
    return sendError(res, "Failed to retrieve classes 2", 500);
  }
}

// 🔹 Create Class
async function createClass(req, res) {
  const { name, collegeId, departmentId } = req.body;

  try {
    const classModel = await prisma.class.create({
      data: {
        name,
        collegeId: parseInt(collegeId),
        departmentId: departmentId ? parseInt(departmentId) : null,
      },
      include: {
        college: true,
        department: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return sendSuccess(res, "Class created successfully", classModel);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create class", 500);
  }
}

// 🔹 Update Class
async function updateClass(req, res) {
  const { id } = req.params;
  const { name, collegeId, departmentId } = req.body;

  try {
    const classModel = await prisma.class.update({
      where: { id: parseInt(id) },
      data: {
        name,
        collegeId: collegeId ? parseInt(collegeId) : undefined,
        departmentId: departmentId ? parseInt(departmentId) : null,
      },
      include: {
        college: true,
        department: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return sendSuccess(res, "Class updated successfully", classModel);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update class", 500);
  }
}

// 🔹 Delete Class
async function deleteClass(req, res) {
  const { id } = req.params;

  try {
    await prisma.class.delete({
      where: { id: parseInt(id) },
    });

    return sendSuccess(res, "Class deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete class", 500);
  }
}

// 🔹 Get All Reports
async function getAllReports(req, res) {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        college: {
          select: {
            id: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { generatedAt: "desc" },
    });

    return sendSuccess(res, "Reports retrieved successfully", reports);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve reports", 500);
  }
}

// 🔹 Download Report
async function downloadReport(req, res) {
  const { reportId } = req.params;

  try {
    const report = await prisma.report.findFirst({
      where: { id: parseInt(reportId) },
    });

    if (!report) {
      return sendError(res, "Report not found", 404);
    }

    if (!report.filePath || !require("fs").existsSync(report.filePath)) {
      return sendError(res, "Report file not found", 404);
    }

    res.download(report.filePath, require("path").basename(report.filePath));
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to download report", 500);
  }
}

// 🔹 Assign Topics to College
async function assignTopicsToCollege(req, res) {
  const { collegeId, topicIds } = req.body;

  try {
    // Remove existing assignments
    await prisma.collegeTopic.deleteMany({
      where: { collegeId: parseInt(collegeId) },
    });

    // Create new assignments
    const assignments = topicIds.map((topicId) => ({
      collegeId: parseInt(collegeId),
      topicId: parseInt(topicId),
    }));

    await prisma.collegeTopic.createMany({
      data: assignments,
    });

    const college = await prisma.college.findUnique({
      where: { id: parseInt(collegeId) },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
      },
    });

    return sendSuccess(res, "Topics assigned to college successfully", college);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to assign topics to college", 500);
  }
}

// 🔹 Get Dashboard Data
async function getDashboardData(req, res) {
  console.log("🚀 getDashboardData called");

  try {
    console.log("⏳ Fetching dashboard counts and recent records...");
    const [
      totalColleges,
      totalUsers,
      totalTopics,
      totalAssessments,
      recentUsers,
      recentColleges,
    ] = await Promise.all([
      prisma.college.count().then((c) => {
        console.log("✅ totalColleges:", c);
        return c;
      }),
      prisma.user.count().then((c) => {
        console.log("✅ totalUsers:", c);
        return c;
      }),
      prisma.topic.count().then((c) => {
        console.log("✅ totalTopics:", c);
        return c;
      }),
      prisma.assessment.count().then((c) => {
        console.log("✅ totalAssessments:", c);
        return c;
      }),
      prisma.user
        .findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { college: true, class: true },
        })
        .then((users) => {
          console.log("✅ recentUsers fetched:", users.length);
          return users;
        }),
      prisma.college
        .findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { users: true, classes: true } } },
        })
        .then((colleges) => {
          console.log("✅ recentColleges fetched:", colleges.length);
          return colleges;
        }),
    ]);

    console.log("⏳ Mapping recentUsers safely...");
    const safeRecentUsers = recentUsers.map((user) => {
      const safeCollege = user.college
        ? { id: user.college.id, name: user.college.name }
        : null;
      const safeClass = user.class
        ? { id: user.class.id, name: user.class.name }
        : null;
      console.log(
        `User ${user.username}: college ->`,
        safeCollege,
        ", class ->",
        safeClass
      );
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        isFirstTimeLogin: user.isFirstTimeLogin,
        lastLogin: user.lastLogin,
        college: safeCollege,
        class: safeClass,
      };
    });

    console.log("⏳ Mapping recentColleges safely...");
    const safeRecentColleges = recentColleges.map((college) => {
      console.log(`College ${college.name}: _count ->`, college._count);
      return {
        id: college.id,
        name: college.name,
        location: college.location,
        stats: {
          totalUsers: college._count?.users ?? 0,
          totalClasses: college._count?.classes ?? 0,
        },
      };
    });

    console.log("✅ Sending success response...");
    return sendSuccess(res, "Dashboard data retrieved successfully", {
      stats: {
        totalColleges,
        totalUsers,
        totalTopics,
        totalAssessments,
      },
      recentUsers: safeRecentUsers,
      recentColleges: safeRecentColleges,
    });
  } catch (err) {
    console.error("🔥 Unexpected error in getDashboardData:", err);
    return sendError(
      res,
      err.message || "Failed to retrieve dashboard data",
      500
    );
  }
}

// Department Management Functions
const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        college: true,
        classes: true,
        users: true,
        teachers: true,
        students: true,
      },
    });

    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, collegeId } = req.body;

    if (!name || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Name and collegeId are required",
      });
    }

    const department = await prisma.department.create({
      data: {
        name,
        collegeId: parseInt(collegeId),
      },
      include: {
        college: true,
        classes: true,
        users: true,
        teachers: true,
        students: true,
      },
    });

    res.status(201).json({
      success: true,
      data: department,
      message: "Department created successfully",
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create department",
      error: error.message,
    });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, collegeId } = req.body;

    if (!name || !collegeId) {
      return res.status(400).json({
        success: false,
        message: "Name and collegeId are required",
      });
    }

    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        name,
        collegeId: parseInt(collegeId),
      },
      include: {
        college: true,
        classes: true,
        users: true,
        teachers: true,
        students: true,
      },
    });

    res.json({
      success: true,
      data: department,
      message: "Department updated successfully",
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update department",
      error: error.message,
    });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.department.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete department",
      error: error.message,
    });
  }
};

// 🔹 Get All Students
async function getAllStudents(req, res) {
  try {
    const {
      collegeId,
      departmentId,
      classId,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const where = {
      role: "STUDENT",
      ...(collegeId && { collegeId: parseInt(collegeId) }),
      ...(departmentId && { departmentId: parseInt(departmentId) }),
      ...(classId && { classId: parseInt(classId) }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          college: true,
          department: true,
          class: true,
          student: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Students retrieved successfully",
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students",
      error: error.message,
    });
  }
}

// 🔹 Get Students by Class
async function getStudentsByClass(req, res) {
  try {
    const { classId } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    const where = {
      role: "STUDENT",
      classId: parseInt(classId),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          college: true,
          department: true,
          class: true,
          student: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { name: "asc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Students retrieved successfully",
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting students by class:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students",
      error: error.message,
    });
  }
}

// 🔹 Get Students by College
async function getStudentsByCollege(req, res) {
  try {
    const { collegeId } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    const where = {
      role: "STUDENT",
      collegeId: parseInt(collegeId),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          college: true,
          department: true,
          class: true,
          student: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { name: "asc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Students retrieved successfully",
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting students by college:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students",
      error: error.message,
    });
  }
}

// 🔹 Get Students by Department
async function getStudentsByDepartment(req, res) {
  try {
    const { departmentId } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    const where = {
      role: "STUDENT",
      departmentId: parseInt(departmentId),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          college: true,
          department: true,
          class: true,
          student: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { name: "asc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Students retrieved successfully",
      data: students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting students by department:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students",
      error: error.message,
    });
  }
}

// 🔹 Get Student Statistics
async function getStudentStatistics(req, res) {
  try {
    const { collegeId, departmentId, classId } = req.query;

    const where = {
      role: "STUDENT",
      ...(collegeId && { collegeId: parseInt(collegeId) }),
      ...(departmentId && { departmentId: parseInt(departmentId) }),
      ...(classId && { classId: parseInt(classId) }),
    };

    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      studentsByCollege,
      studentsByDepartment,
      studentsByClass,
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.user.count({ where: { ...where, status: "INACTIVE" } }),
      prisma.user.groupBy({
        by: ["collegeId"],
        where,
        _count: { id: true },
        include: {
          college: {
            select: { name: true },
          },
        },
      }),
      prisma.user.groupBy({
        by: ["departmentId"],
        where,
        _count: { id: true },
        include: {
          department: {
            select: { name: true },
          },
        },
      }),
      prisma.user.groupBy({
        by: ["classId"],
        where,
        _count: { id: true },
        include: {
          class: {
            select: { name: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      message: "Student statistics retrieved successfully",
      data: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        studentsByCollege,
        studentsByDepartment,
        studentsByClass,
      },
    });
  } catch (error) {
    console.error("Error getting student statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve student statistics",
      error: error.message,
    });
  }
}

module.exports = {
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
};
