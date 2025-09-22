const { prisma } = require('../prisma/prisma');
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
     
      prisma.college.count().then(c => {
        console.log("✅ totalColleges:", c);
        return c;
      }),
      prisma.user.count().then(c => {
        console.log("✅ totalUsers:", c);
        return c;
      }),
      prisma.topic.count().then(c => {
        console.log("✅ totalTopics:", c);
        return c;
      }),
      prisma.assessment.count().then(c => {
        console.log("✅ totalAssessments:", c);
        return c;
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { college: true, class: true },
      }).then(users => {
        console.log("✅ recentUsers fetched:", users.length);
        return users;
      }),
      prisma.college.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { users: true, classes: true } } },
      }).then(colleges => {
        console.log("✅ recentColleges fetched:", colleges.length);
        return colleges;
      }),
    ]);

    console.log("⏳ Mapping recentUsers safely...");
    const safeRecentUsers = recentUsers.map(user => {
      const safeCollege = user.college
        ? { id: user.college.id, name: user.college.name }
        : null;
      const safeClass = user.class
        ? { id: user.class.id, name: user.class.name }
        : null;
      console.log(`User ${user.username}: college ->`, safeCollege, ", class ->", safeClass);
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
    const safeRecentColleges = recentColleges.map(college => {
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
    return sendError(res, err.message || "Failed to retrieve dashboard data", 500);
  }

}







module.exports = {
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
};
