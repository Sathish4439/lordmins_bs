const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function newSeedData() {
  try {
    console.log("🌱 Starting new data seeding...");

    // Clear existing data in correct order (respecting foreign key constraints)
    console.log("🗑️ Clearing existing data...");

    await prisma.assessmentResult.deleteMany();
    await prisma.studentTopicProgress.deleteMany();
    await prisma.initialAssessment.deleteMany();
    await prisma.question.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.subTopic.deleteMany();
    await prisma.collegeTopic.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.topicUnlockRule.deleteMany();
    await prisma.collegeCourse.deleteMany();
    await prisma.course.deleteMany();
    await prisma.report.deleteMany();
    await prisma.timesheet.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.file.deleteMany();

    // Delete role-specific tables
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.administrativeAccess.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.superAdmin.deleteMany();

    // Delete main tables
    await prisma.user.deleteMany();
    await prisma.class.deleteMany();
    await prisma.department.deleteMany();
    await prisma.college.deleteMany();

    console.log("✅ Cleared existing data");

    // Create Colleges
    const colleges = await Promise.all([
      prisma.college.create({
        data: {
          name: "M. Kumarasaamy College of Engineering And Technology",
          location: "Karur, Tamil Nadu",
        },
      }),
      prisma.college.create({
        data: {
          name: "Anna University - Chennai",
          location: "Chennai, Tamil Nadu",
        },
      }),
      prisma.college.create({
        data: {
          name: "VIT University",
          location: "Vellore, Tamil Nadu",
        },
      }),
      prisma.college.create({
        data: {
          name: "SRM Institute of Science and Technology",
          location: "Chennai, Tamil Nadu",
        },
      }),
    ]);

    console.log("🏫 Created colleges");

    // Create Departments for each college
    const departments = [];
    const departmentNames = [
      "Computer Science and Engineering",
      "Information Technology",
      "Electronics and Communication Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical and Electronics Engineering",
      "Aerospace Engineering",
      "Biotechnology",
      "Chemical Engineering",
      "Data Science and Analytics",
    ];

    for (const college of colleges) {
      // Each college gets 4-6 departments
      const collegeDeptCount = 4 + Math.floor(Math.random() * 3);
      const shuffledDepts = departmentNames.sort(() => 0.5 - Math.random());

      for (let i = 0; i < collegeDeptCount; i++) {
        const dept = await prisma.department.create({
          data: {
            name: shuffledDepts[i],
            collegeId: college.id,
          },
        });
        departments.push(dept);
      }
    }

    console.log("🏢 Created departments");

    // Create Classes for each department
    const classes = [];
    const classNames = [
      "First Year",
      "Second Year",
      "Third Year",
      "Fourth Year",
    ];

    for (const department of departments) {
      // Each department gets 2-4 classes
      const classCount = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < classCount; i++) {
        const classModel = await prisma.class.create({
          data: {
            name: classNames[i],
            collegeId: department.collegeId,
            departmentId: department.id,
          },
        });
        classes.push(classModel);
      }
    }

    console.log("📚 Created classes");

    // Create Super Admin
    const superAdminPassword = await bcrypt.hash("superadmin123", 10);
    const superAdmin = await prisma.user.create({
      data: {
        username: "superadmin",
        passwordHash: superAdminPassword,
        role: "SUPER_ADMIN",
        name: "Super Admin",
        email: "superadmin@lordminds.com",
        status: "ACTIVE",
        isFirstTimeLogin: false,
        superAdmin: {
          create: {},
        },
      },
    });

    console.log("👑 Created Super Admin");

    // Create Admins
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admins = await Promise.all([
      prisma.user.create({
        data: {
          username: "admin1",
          passwordHash: adminPassword,
          role: "ADMIN",
          name: "Dr. Rajesh Kumar",
          email: "admin1@lordminds.com",
          status: "ACTIVE",
          isFirstTimeLogin: false,
          admin: {
            create: {},
          },
        },
      }),
      prisma.user.create({
        data: {
          username: "admin2",
          passwordHash: adminPassword,
          role: "ADMIN",
          name: "Dr. Priya Sharma",
          email: "admin2@lordminds.com",
          status: "ACTIVE",
          isFirstTimeLogin: false,
          admin: {
            create: {},
          },
        },
      }),
    ]);

    console.log("👨‍💼 Created Admins");

    // Create Administrative Access users for each college
    const adminAccessPassword = await bcrypt.hash("adminaccess123", 10);
    const administrativeUsers = [];

    for (let i = 0; i < colleges.length; i++) {
      const adminUser = await prisma.user.create({
        data: {
          username: `admin_access_${colleges[i].name
            .toLowerCase()
            .replace(/\s+/g, "_")}`,
          passwordHash: adminAccessPassword,
          role: "ADMINISTRATIVE_ACCESS",
          name: `${colleges[i].name} Admin`,
          email: `admin.${colleges[i].name
            .toLowerCase()
            .replace(/\s+/g, "_")}@lordminds.com`,
          collegeId: colleges[i].id,
          status: "ACTIVE",
          isFirstTimeLogin: false,
          administrativeAccess: {
            create: {
              collegeId: colleges[i].id,
            },
          },
        },
      });
      administrativeUsers.push(adminUser);
    }

    console.log("🏢 Created Administrative Access users");

    // Create Teachers for each department
    const teacherPassword = await bcrypt.hash("teacher123", 10);
    const teachers = [];

    const teacherNames = [
      "Dr. Suresh Kumar",
      "Prof. Meera Patel",
      "Dr. Anil Gupta",
      "Prof. Sunita Reddy",
      "Dr. Vikram Singh",
      "Prof. Kavita Joshi",
      "Dr. Ramesh Iyer",
      "Prof. Deepa Nair",
      "Dr. Manoj Sharma",
      "Prof. Rekha Agarwal",
      "Dr. Pradeep Kumar",
      "Prof. Shilpa Rao",
      "Dr. Ashok Verma",
      "Prof. Neha Gupta",
      "Dr. Rajesh Tiwari",
      "Prof. Priya Singh",
    ];

    for (const department of departments) {
      // Each department gets 2-4 teachers
      const teacherCount = 2 + Math.floor(Math.random() * 3);
      const shuffledTeachers = teacherNames.sort(() => 0.5 - Math.random());

      for (let i = 0; i < teacherCount; i++) {
        const teacher = await prisma.user.create({
          data: {
            username: `teacher_${department.id}_${i + 1}`,
            passwordHash: teacherPassword,
            role: "TEACHER",
            name: shuffledTeachers[i],
            email: `teacher.${department.id}.${i + 1}@lordminds.com`,
            collegeId: department.collegeId,
            departmentId: department.id,
            status: "ACTIVE",
            isFirstTimeLogin: false,
            teacher: {
              create: {
                collegeId: department.collegeId,
                departmentId: department.id,
              },
            },
          },
        });
        teachers.push(teacher);
      }
    }

    console.log("👩‍🏫 Created Teachers");

    // Create Students for each class
    const studentPassword = await bcrypt.hash("student123", 10);
    const students = [];

    const studentFirstNames = [
      "Arjun",
      "Priya",
      "Rahul",
      "Sneha",
      "Vikram",
      "Anita",
      "Rajesh",
      "Meera",
      "Suresh",
      "Kavita",
      "Manoj",
      "Deepa",
      "Pradeep",
      "Shilpa",
      "Ashok",
      "Neha",
      "Ramesh",
      "Sunita",
      "Anil",
      "Rekha",
      "Vikram",
      "Kavita",
      "Suresh",
      "Meera",
    ];

    const studentLastNames = [
      "Kumar",
      "Sharma",
      "Patel",
      "Reddy",
      "Singh",
      "Joshi",
      "Iyer",
      "Nair",
      "Gupta",
      "Agarwal",
      "Rao",
      "Verma",
      "Tiwari",
      "Pandey",
      "Mishra",
      "Yadav",
    ];

    for (const classModel of classes) {
      // Each class gets 15-25 students
      const studentCount = 15 + Math.floor(Math.random() * 11);

      for (let i = 1; i <= studentCount; i++) {
        const firstName =
          studentFirstNames[
            Math.floor(Math.random() * studentFirstNames.length)
          ];
        const lastName =
          studentLastNames[Math.floor(Math.random() * studentLastNames.length)];
        const fullName = `${firstName} ${lastName}`;

        const student = await prisma.user.create({
          data: {
            username: `student_${classModel.id}_${i}`,
            passwordHash: studentPassword,
            role: "STUDENT",
            name: fullName,
            email: `student.${classModel.id}.${i}@lordminds.com`,
            collegeId: classModel.collegeId,
            departmentId: classModel.departmentId,
            classId: classModel.id,
            rollNo: `${classModel.id}${i.toString().padStart(3, "0")}`,
            dob: new Date(
              2000 + Math.floor(Math.random() * 5),
              Math.floor(Math.random() * 12),
              Math.floor(Math.random() * 28) + 1
            ),
            status: "ACTIVE",
            isFirstTimeLogin: false,
            student: {
              create: {
                collegeId: classModel.collegeId,
                departmentId: classModel.departmentId,
                classId: classModel.id,
                rollNo: `${classModel.id}${i.toString().padStart(3, "0")}`,
              },
            },
          },
        });
        students.push(student);
      }
    }

    console.log("🎓 Created Students");

    // Create comprehensive Topics
    const topics = await Promise.all([
      prisma.topic.create({
        data: {
          title: "Programming Fundamentals",
          description:
            "Introduction to programming concepts, algorithms, and problem-solving techniques",
          order: 1,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Data Structures and Algorithms",
          description:
            "Understanding and implementing various data structures and algorithmic approaches",
          order: 2,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Database Management Systems",
          description:
            "Database design, SQL, and database administration concepts",
          order: 3,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Web Development",
          description:
            "Frontend and backend web development technologies and frameworks",
          order: 4,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Software Engineering",
          description:
            "Software development lifecycle, methodologies, and best practices",
          order: 5,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Computer Networks",
          description: "Network protocols, architecture, and security concepts",
          order: 6,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Operating Systems",
          description:
            "OS concepts, process management, memory management, and file systems",
          order: 7,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Machine Learning",
          description:
            "Introduction to ML algorithms, data preprocessing, and model evaluation",
          order: 8,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Cybersecurity",
          description:
            "Information security, cryptography, and ethical hacking concepts",
          order: 9,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Mobile Application Development",
          description: "Cross-platform and native mobile app development",
          order: 10,
          createdById: superAdmin.id,
        },
      }),
    ]);

    console.log("📖 Created Topics");

    // Create SubTopics for each topic
    const subTopics = [];
    for (const topic of topics) {
      const topicSubTopics = await Promise.all([
        prisma.subTopic.create({
          data: {
            topicId: topic.id,
            title: `${topic.title} - Introduction`,
            contentText: `Welcome to ${topic.title}! This module covers the fundamental concepts and basic principles that form the foundation of this subject. You'll learn about key terminology, basic concepts, and get an overview of what you'll be studying in this course.`,
            order: 1,
          },
        }),
        prisma.subTopic.create({
          data: {
            topicId: topic.id,
            title: `${topic.title} - Core Concepts`,
            contentText: `Dive deeper into ${topic.title} with this comprehensive module on core concepts. You'll explore the main theories, principles, and methodologies that are essential for understanding this subject.`,
            order: 2,
          },
        }),
        prisma.subTopic.create({
          data: {
            topicId: topic.id,
            title: `${topic.title} - Advanced Topics`,
            contentText: `Master advanced concepts in ${topic.title} with this challenging module. You'll learn about complex theories, advanced techniques, and cutting-edge developments in the field.`,
            order: 3,
          },
        }),
        prisma.subTopic.create({
          data: {
            topicId: topic.id,
            title: `${topic.title} - Practical Applications`,
            contentText: `Apply your knowledge of ${topic.title} in real-world scenarios. This module focuses on practical implementation, case studies, and hands-on projects that demonstrate how the concepts are used in industry.`,
            order: 4,
          },
        }),
      ]);
      subTopics.push(...topicSubTopics);
    }

    console.log("📝 Created SubTopics");

    // Assign topics to colleges based on their departments
    const collegeTopics = [];
    for (const college of colleges) {
      const collegeDepartments = departments.filter(
        (d) => d.collegeId === college.id
      );

      // Assign relevant topics based on department types
      for (const dept of collegeDepartments) {
        if (
          dept.name.includes("Computer Science") ||
          dept.name.includes("Information Technology") ||
          dept.name.includes("Data Science")
        ) {
          // CS/IT departments get programming, web dev, ML topics
          const relevantTopics = [
            topics[0],
            topics[1],
            topics[3],
            topics[7],
            topics[9],
          ];
          for (const topic of relevantTopics) {
            collegeTopics.push({ collegeId: college.id, topicId: topic.id });
          }
        } else if (
          dept.name.includes("Electronics") ||
          dept.name.includes("Electrical")
        ) {
          // Electronics departments get networks, OS topics
          const relevantTopics = [topics[5], topics[6], topics[8]];
          for (const topic of relevantTopics) {
            collegeTopics.push({ collegeId: college.id, topicId: topic.id });
          }
        } else {
          // Other departments get general topics
          const relevantTopics = [topics[0], topics[2], topics[4]];
          for (const topic of relevantTopics) {
            collegeTopics.push({ collegeId: college.id, topicId: topic.id });
          }
        }
      }
    }

    // Remove duplicates and create college topics
    const uniqueCollegeTopics = collegeTopics.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.collegeId === item.collegeId && t.topicId === item.topicId
        )
    );

    await prisma.collegeTopic.createMany({
      data: uniqueCollegeTopics,
    });

    console.log("🔗 Assigned topics to colleges");

    // Create Assessments for sub-topics
    const assessments = [];
    for (let i = 0; i < Math.min(20, subTopics.length); i++) {
      const subTopic = subTopics[i];
      const topic = topics.find((t) => t.id === subTopic.topicId);

      const assessment = await prisma.assessment.create({
        data: {
          title: `Assessment: ${subTopic.title}`,
          description: `Test your understanding of ${subTopic.title}. This assessment covers key concepts and practical applications.`,
          type: "QUESTIONS",
          subTopicId: subTopic.id,
          passingScore: 60.0,
          timeLimit: 30,
          createdById: admins[0].id,
          questions: {
            create: [
              {
                topic: topic.title,
                subTopic: subTopic.title,
                questionText: `What is the primary focus of ${subTopic.title}?`,
                options: JSON.stringify([
                  "Basic concepts and fundamentals",
                  "Advanced theoretical knowledge",
                  "Practical implementation",
                  "All of the above",
                ]),
                correctAnswerIndex: 3,
                explanation: `This sub-topic covers all aspects from basic concepts to advanced knowledge and practical implementation.`,
                timeLimitSec: 60,
              },
              {
                topic: topic.title,
                subTopic: subTopic.title,
                questionText: `Which approach is most effective for mastering ${subTopic.title}?`,
                options: JSON.stringify([
                  "Memorization only",
                  "Understanding concepts",
                  "Hands-on practice",
                  "Both B and C",
                ]),
                correctAnswerIndex: 3,
                explanation: `Understanding concepts combined with hands-on practice is the most effective approach for mastering this topic.`,
                timeLimitSec: 60,
              },
              {
                topic: topic.title,
                subTopic: subTopic.title,
                questionText: `What is the main benefit of studying ${subTopic.title}?`,
                options: JSON.stringify([
                  "Academic knowledge only",
                  "Career preparation",
                  "Problem-solving skills",
                  "All of the above",
                ]),
                correctAnswerIndex: 3,
                explanation: `Studying this topic provides academic knowledge, career preparation, and develops problem-solving skills.`,
                timeLimitSec: 60,
              },
            ],
          },
        },
      });
      assessments.push(assessment);
    }

    console.log("📋 Created Assessments");

    // Create sample assessment results for some students
    for (let i = 0; i < Math.min(50, students.length); i++) {
      const student = students[i];
      const assessment = assessments[i % assessments.length];

      const score = 60 + Math.floor(Math.random() * 35); // Score between 60-95
      const passed = score >= 60;

      await prisma.assessmentResult.create({
        data: {
          assessmentId: assessment.id,
          studentId: student.id,
          score: score,
          total: 3,
          timeSpentSec: 120 + Math.floor(Math.random() * 120), // 2-4 minutes
          passed: passed,
          details: JSON.stringify([
            { questionId: 1, selectedIndex: 3, isCorrect: true },
            { questionId: 2, selectedIndex: 3, isCorrect: true },
            { questionId: 3, selectedIndex: 3, isCorrect: true },
          ]),
        },
      });
    }

    console.log("📊 Created sample assessment results");

    // Create student progress for some students
    for (let i = 0; i < Math.min(100, students.length); i++) {
      const student = students[i];
      const subTopic = subTopics[i % subTopics.length];

      const statuses = ["LOCKED", "UNLOCKED", "IN_PROGRESS", "COMPLETED"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.studentTopicProgress.create({
        data: {
          studentId: student.id,
          subTopicId: subTopic.id,
          status: status,
          score:
            status === "COMPLETED" ? 70 + Math.floor(Math.random() * 25) : null,
          attempts:
            status === "COMPLETED" ? 1 + Math.floor(Math.random() * 3) : 0,
          timeSpent:
            status === "COMPLETED" ? 300 + Math.floor(Math.random() * 600) : 0,
          lastAttemptAt: status !== "LOCKED" ? new Date() : null,
          unlockedAt:
            status !== "LOCKED"
              ? new Date(
                  Date.now() -
                    Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
                )
              : null,
        },
      });
    }

    console.log("📈 Created student progress");

    // Create initial assessments for some students
    for (let i = 0; i < Math.min(20, students.length); i++) {
      const student = students[i];

      await prisma.initialAssessment.create({
        data: {
          studentId: student.id,
          score: 65 + Math.floor(Math.random() * 30),
          total: 10,
          timeSpentSec: 600 + Math.floor(Math.random() * 600),
          details: JSON.stringify([
            { questionId: 1, selectedIndex: 2, isCorrect: true },
            { questionId: 2, selectedIndex: 1, isCorrect: false },
            { questionId: 3, selectedIndex: 3, isCorrect: true },
            { questionId: 4, selectedIndex: 0, isCorrect: true },
            { questionId: 5, selectedIndex: 2, isCorrect: false },
          ]),
        },
      });
    }

    console.log("🎯 Created initial assessments");

    // Create some courses
    const courses = await Promise.all([
      prisma.course.create({
        data: {
          title: "Bachelor of Technology in Computer Science",
          description:
            "Comprehensive B.Tech program in Computer Science and Engineering",
          category: "Engineering",
        },
      }),
      prisma.course.create({
        data: {
          title: "Bachelor of Technology in Information Technology",
          description:
            "B.Tech program focusing on Information Technology and software development",
          category: "Engineering",
        },
      }),
      prisma.course.create({
        data: {
          title: "Bachelor of Technology in Electronics and Communication",
          description:
            "B.Tech program in Electronics and Communication Engineering",
          category: "Engineering",
        },
      }),
      prisma.course.create({
        data: {
          title: "Master of Technology in Data Science",
          description: "Advanced M.Tech program in Data Science and Analytics",
          category: "Post Graduate",
        },
      }),
    ]);

    // Assign courses to colleges
    for (const college of colleges) {
      const courseCount = 2 + Math.floor(Math.random() * 3);
      const shuffledCourses = courses.sort(() => 0.5 - Math.random());

      for (let i = 0; i < courseCount; i++) {
        await prisma.collegeCourse.create({
          data: {
            collegeId: college.id,
            courseId: shuffledCourses[i].id,
          },
        });
      }
    }

    console.log("🎓 Created courses and assignments");

    console.log("✅ New data seeding completed successfully!");
    console.log("\n📋 New Data Summary:");
    console.log(`- Colleges: ${colleges.length}`);
    console.log(`- Departments: ${departments.length}`);
    console.log(`- Classes: ${classes.length}`);
    console.log(
      `- Users: ${
        1 +
        admins.length +
        administrativeUsers.length +
        teachers.length +
        students.length
      }`
    );
    console.log(`- Topics: ${topics.length}`);
    console.log(`- SubTopics: ${subTopics.length}`);
    console.log(`- Assessments: ${assessments.length}`);
    console.log(`- Courses: ${courses.length}`);

    console.log("\n🔑 Test Credentials:");
    console.log("Super Admin: superadmin / superadmin123");
    console.log("Admin: admin1 / admin123");
    console.log("Teacher: teacher_1_1 / teacher123");
    console.log("Student: student_1_1 / student123");
    console.log(
      "Administrative: admin_access_m._kumarasaamy_college_of_engineering_and_technology / adminaccess123"
    );

    console.log("\n🏫 College Details:");
    colleges.forEach((college, index) => {
      const collegeDepts = departments.filter(
        (d) => d.collegeId === college.id
      );
      const collegeClasses = classes.filter((c) => c.collegeId === college.id);
      const collegeStudents = students.filter(
        (s) => s.collegeId === college.id
      );
      console.log(`${index + 1}. ${college.name}`);
      console.log(`   - Departments: ${collegeDepts.length}`);
      console.log(`   - Classes: ${collegeClasses.length}`);
      console.log(`   - Students: ${collegeStudents.length}`);
    });
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  newSeedData()
    .then(() => {
      console.log("🎉 New seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 New seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { newSeedData };

