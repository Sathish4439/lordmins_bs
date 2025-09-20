const { prisma } = require("../prisma/prisma.js");
const { sendSuccess, sendError } = require("../utils/response");

// 🔹 Get Administrative Profile
async function getProfile(req, res) {
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        college: true,
        administrativeAccess: true,
      },
    });

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, "Profile retrieved successfully", user);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve profile", 500);
  }
}

// 🔹 Get College Details
async function getCollegeDetails(req, res) {
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        college: {
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
            _count: {
              select: {
                users: true,
                classes: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    return sendSuccess(res, "College details retrieved successfully", user.college);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve college details", 500);
  }
}

// 🔹 Get All Classes
async function getAllClasses(req, res) {
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        college: {
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
                _count: {
                  select: {
                    users: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    return sendSuccess(res, "Classes retrieved successfully", user.college.classes);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve classes", 500);
  }
}

// 🔹 Create Class
async function createClass(req, res) {
  const { userId } = req.user;
  const { name } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        collegeId: user.college.id,
      },
      include: {
        college: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return sendSuccess(res, "Class created successfully", newClass);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create class", 500);
  }
}

// 🔹 Update Class
async function updateClass(req, res) {
  const { classId } = req.params;
  const { name } = req.body;
  const { userId } = req.user;

  try {
    // Verify the class belongs to the user's college
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    const classToUpdate = await prisma.class.findFirst({
      where: {
        id: parseInt(classId),
        collegeId: user.college.id,
      },
    });

    if (!classToUpdate) {
      return sendError(res, "Class not found or access denied", 404);
    }

    const updatedClass = await prisma.class.update({
      where: { id: parseInt(classId) },
      data: { name },
      include: {
        college: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return sendSuccess(res, "Class updated successfully", updatedClass);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update class", 500);
  }
}

// 🔹 Delete Class
async function deleteClass(req, res) {
  const { classId } = req.params;
  const { userId } = req.user;

  try {
    // Verify the class belongs to the user's college
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    const classToDelete = await prisma.class.findFirst({
      where: {
        id: parseInt(classId),
        collegeId: user.college.id,
      },
    });

    if (!classToDelete) {
      return sendError(res, "Class not found or access denied", 404);
    }

    await prisma.class.delete({
      where: { id: parseInt(classId) },
    });

    return sendSuccess(res, "Class deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete class", 500);
  }
}

// 🔹 Get All Students
async function getAllStudents(req, res) {
  const { userId } = req.user;
  const { classId } = req.query;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    const where = {
      role: "STUDENT",
      collegeId: user.college.id,
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

// 🔹 Create Student
async function createStudent(req, res) {
  const { userId } = req.user;
  const {
    username,
    password,
    name,
    email,
    classId,
    rollNo,
    dob,
  } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    // Verify class belongs to the college
    const classExists = await prisma.class.findFirst({
      where: {
        id: parseInt(classId),
        collegeId: user.college.id,
      },
    });

    if (!classExists) {
      return sendError(res, "Class not found or access denied", 404);
    }

    const bcrypt = require("bcrypt");
    const hashed = await bcrypt.hash(password, 10);

    const student = await prisma.user.create({
      data: {
        username,
        passwordHash: hashed,
        role: "STUDENT",
        name,
        email,
        collegeId: user.college.id,
        classId: parseInt(classId),
        rollNo,
        dob: dob ? new Date(dob) : null,
        student: {
          create: {
            collegeId: user.college.id,
            classId: parseInt(classId),
            rollNo,
          },
        },
      },
      include: {
        college: true,
        class: true,
        student: true,
      },
    });

    return sendSuccess(res, "Student created successfully", student);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002") {
      return sendError(res, "Username or email already exists", 400);
    }
    return sendError(res, "Failed to create student", 500);
  }
}

// 🔹 Update Student
async function updateStudent(req, res) {
  const { studentId } = req.params;
  const { name, email, classId, rollNo, status } = req.body;
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    // Verify student belongs to the college
    const student = await prisma.user.findFirst({
      where: {
        id: parseInt(studentId),
        role: "STUDENT",
        collegeId: user.college.id,
      },
    });

    if (!student) {
      return sendError(res, "Student not found or access denied", 404);
    }

    // If changing class, verify it belongs to the college
    if (classId) {
      const classExists = await prisma.class.findFirst({
        where: {
          id: parseInt(classId),
          collegeId: user.college.id,
        },
      });

      if (!classExists) {
        return sendError(res, "Class not found or access denied", 404);
      }
    }

    const updatedStudent = await prisma.user.update({
      where: { id: parseInt(studentId) },
      data: {
        name,
        email,
        classId: classId ? parseInt(classId) : undefined,
        rollNo,
        status,
      },
      include: {
        college: true,
        class: true,
        student: true,
      },
    });

    return sendSuccess(res, "Student updated successfully", updatedStudent);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update student", 500);
  }
}

// 🔹 Delete Student
async function deleteStudent(req, res) {
  const { studentId } = req.params;
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    // Verify student belongs to the college
    const student = await prisma.user.findFirst({
      where: {
        id: parseInt(studentId),
        role: "STUDENT",
        collegeId: user.college.id,
      },
    });

    if (!student) {
      return sendError(res, "Student not found or access denied", 404);
    }

    await prisma.user.delete({
      where: { id: parseInt(studentId) },
    });

    return sendSuccess(res, "Student deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete student", 500);
  }
}

// 🔹 Get All Teachers
async function getAllTeachers(req, res) {
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER",
        collegeId: user.college.id,
      },
      include: {
        college: true,
        teacher: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(res, "Teachers retrieved successfully", teachers);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve teachers", 500);
  }
}

// 🔹 Create Teacher
async function createTeacher(req, res) {
  const { userId } = req.user;
  const {
    username,
    password,
    name,
    email,
  } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    const bcrypt = require("bcrypt");
    const hashed = await bcrypt.hash(password, 10);

    const teacher = await prisma.user.create({
      data: {
        username,
        passwordHash: hashed,
        role: "TEACHER",
        name,
        email,
        collegeId: user.college.id,
        teacher: {
          create: {
            collegeId: user.college.id,
          },
        },
      },
      include: {
        college: true,
        teacher: true,
      },
    });

    return sendSuccess(res, "Teacher created successfully", teacher);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002") {
      return sendError(res, "Username or email already exists", 400);
    }
    return sendError(res, "Failed to create teacher", 500);
  }
}

// 🔹 Update Teacher
async function updateTeacher(req, res) {
  const { teacherId } = req.params;
  const { name, email, status } = req.body;
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    // Verify teacher belongs to the college
    const teacher = await prisma.user.findFirst({
      where: {
        id: parseInt(teacherId),
        role: "TEACHER",
        collegeId: user.college.id,
      },
    });

    if (!teacher) {
      return sendError(res, "Teacher not found or access denied", 404);
    }

    const updatedTeacher = await prisma.user.update({
      where: { id: parseInt(teacherId) },
      data: {
        name,
        email,
        status,
      },
      include: {
        college: true,
        teacher: true,
      },
    });

    return sendSuccess(res, "Teacher updated successfully", updatedTeacher);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update teacher", 500);
  }
}

// 🔹 Delete Teacher
async function deleteTeacher(req, res) {
  const { teacherId } = req.params;
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    // Verify teacher belongs to the college
    const teacher = await prisma.user.findFirst({
      where: {
        id: parseInt(teacherId),
        role: "TEACHER",
        collegeId: user.college.id,
      },
    });

    if (!teacher) {
      return sendError(res, "Teacher not found or access denied", 404);
    }

    await prisma.user.delete({
      where: { id: parseInt(teacherId) },
    });

    return sendSuccess(res, "Teacher deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete teacher", 500);
  }
}

// 🔹 Get Dashboard Data
async function getDashboardData(req, res) {
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user || !user.college) {
      return sendError(res, "College not found", 404);
    }

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      recentStudents,
      recentTeachers,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "STUDENT",
          collegeId: user.college.id,
        },
      }),
      prisma.user.count({
        where: {
          role: "TEACHER",
          collegeId: user.college.id,
        },
      }),
      prisma.class.count({
        where: {
          collegeId: user.college.id,
        },
      }),
      prisma.user.findMany({
        where: {
          role: "STUDENT",
          collegeId: user.college.id,
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          class: true,
        },
      }),
      prisma.user.findMany({
        where: {
          role: "TEACHER",
          collegeId: user.college.id,
        },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return sendSuccess(res, "Dashboard data retrieved successfully", {
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
      },
      recentStudents,
      recentTeachers,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve dashboard data", 500);
  }
}

module.exports = {
  getProfile,
  getCollegeDetails,
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getDashboardData,
};
