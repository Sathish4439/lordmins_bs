const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log("🌱 Starting data seeding...");

    // Clear existing data
    await prisma.assessmentResult.deleteMany();
    await prisma.studentTopicProgress.deleteMany();
    await prisma.initialAssessment.deleteMany();
    await prisma.question.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.subTopic.deleteMany();
    await prisma.collegeTopic.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.class.deleteMany();
    await prisma.user.deleteMany();
    await prisma.college.deleteMany();

    console.log("🗑️ Cleared existing data");

    // Create colleges
    const colleges = await Promise.all([
      prisma.college.create({
        data: {
          name: "ABC Engineering College",
          location: "Mumbai, Maharashtra",
        },
      }),
      prisma.college.create({
        data: {
          name: "XYZ Medical College",
          location: "Delhi, NCR",
        },
      }),
      prisma.college.create({
        data: {
          name: "PQR Business School",
          location: "Bangalore, Karnataka",
        },
      }),
    ]);

    console.log("🏫 Created colleges");

    // Create classes for each college
    const classes = [];
    for (const college of colleges) {
      const collegeClasses = await Promise.all([
        prisma.class.create({
          data: {
            name: "First Year",
            collegeId: college.id,
          },
        }),
        prisma.class.create({
          data: {
            name: "Second Year",
            collegeId: college.id,
          },
        }),
        prisma.class.create({
          data: {
            name: "Third Year",
            collegeId: college.id,
          },
        }),
      ]);
      classes.push(...collegeClasses);
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
          name: "Admin One",
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
          name: "Admin Two",
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

    // Create Administrative Access users
    const adminAccessPassword = await bcrypt.hash("adminaccess123", 10);
    const administrativeUsers = await Promise.all([
      prisma.user.create({
        data: {
          username: "admin_access_abc",
          passwordHash: adminAccessPassword,
          role: "ADMINISTRATIVE_ACCESS",
          name: "ABC College Admin",
          email: "admin.abc@lordminds.com",
          collegeId: colleges[0].id,
          status: "ACTIVE",
          isFirstTimeLogin: false,
          administrativeAccess: {
            create: {
              collegeId: colleges[0].id,
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          username: "admin_access_xyz",
          passwordHash: adminAccessPassword,
          role: "ADMINISTRATIVE_ACCESS",
          name: "XYZ College Admin",
          email: "admin.xyz@lordminds.com",
          collegeId: colleges[1].id,
          status: "ACTIVE",
          isFirstTimeLogin: false,
          administrativeAccess: {
            create: {
              collegeId: colleges[1].id,
            },
          },
        },
      }),
    ]);

    console.log("🏢 Created Administrative Access users");

    // Create Teachers
    const teacherPassword = await bcrypt.hash("teacher123", 10);
    const teachers = await Promise.all([
      prisma.user.create({
        data: {
          username: "teacher1",
          passwordHash: teacherPassword,
          role: "TEACHER",
          name: "Dr. John Smith",
          email: "john.smith@lordminds.com",
          collegeId: colleges[0].id,
          status: "ACTIVE",
          isFirstTimeLogin: false,
          teacher: {
            create: {
              collegeId: colleges[0].id,
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          username: "teacher2",
          passwordHash: teacherPassword,
          role: "TEACHER",
          name: "Prof. Jane Doe",
          email: "jane.doe@lordminds.com",
          collegeId: colleges[1].id,
          status: "ACTIVE",
          isFirstTimeLogin: false,
          teacher: {
            create: {
              collegeId: colleges[1].id,
            },
          },
        },
      }),
    ]);

    console.log("👩‍🏫 Created Teachers");

    // Create Students
    const studentPassword = await bcrypt.hash("student123", 10);
    const students = [];
    
    // Create students for ABC College
    for (let i = 1; i <= 10; i++) {
      const student = await prisma.user.create({
        data: {
          username: `student_abc_${i}`,
          passwordHash: studentPassword,
          role: "STUDENT",
          name: `Student ABC ${i}`,
          email: `student.abc.${i}@lordminds.com`,
          collegeId: colleges[0].id,
          classId: classes[0].id, // First Year
          rollNo: `ABC${i.toString().padStart(3, '0')}`,
          dob: new Date(2000 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          status: "ACTIVE",
          isFirstTimeLogin: false,
          student: {
            create: {
              collegeId: colleges[0].id,
              classId: classes[0].id,
              rollNo: `ABC${i.toString().padStart(3, '0')}`,
            },
          },
        },
      });
      students.push(student);
    }

    // Create students for XYZ College
    for (let i = 1; i <= 8; i++) {
      const student = await prisma.user.create({
        data: {
          username: `student_xyz_${i}`,
          passwordHash: studentPassword,
          role: "STUDENT",
          name: `Student XYZ ${i}`,
          email: `student.xyz.${i}@lordminds.com`,
          collegeId: colleges[1].id,
          classId: classes[3].id, // First Year for XYZ
          rollNo: `XYZ${i.toString().padStart(3, '0')}`,
          dob: new Date(2000 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          status: "ACTIVE",
          isFirstTimeLogin: false,
          student: {
            create: {
              collegeId: colleges[1].id,
              classId: classes[3].id,
              rollNo: `XYZ${i.toString().padStart(3, '0')}`,
            },
          },
        },
      });
      students.push(student);
    }

    console.log("🎓 Created Students");

    // Create Topics
    const topics = await Promise.all([
      prisma.topic.create({
        data: {
          title: "Mathematics Fundamentals",
          description: "Basic mathematical concepts and problem-solving techniques",
          order: 1,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Physics Principles",
          description: "Core physics concepts and their applications",
          order: 2,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Chemistry Basics",
          description: "Fundamental chemistry concepts and laboratory techniques",
          order: 3,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Computer Programming",
          description: "Introduction to programming languages and algorithms",
          order: 4,
          createdById: superAdmin.id,
        },
      }),
      prisma.topic.create({
        data: {
          title: "Data Structures",
          description: "Understanding and implementing various data structures",
          order: 5,
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
            contentText: `This is an introduction to ${topic.title}. Learn the basic concepts and fundamentals.`,
            order: 1,
          },
        }),
        prisma.subTopic.create({
          data: {
            topicId: topic.id,
            title: `${topic.title} - Advanced Concepts`,
            contentText: `Dive deeper into ${topic.title} with advanced concepts and practical applications.`,
            order: 2,
          },
        }),
        prisma.subTopic.create({
          data: {
            topicId: topic.id,
            title: `${topic.title} - Practical Applications`,
            contentText: `Apply your knowledge of ${topic.title} in real-world scenarios and projects.`,
            order: 3,
          },
        }),
      ]);
      subTopics.push(...topicSubTopics);
    }

    console.log("📝 Created SubTopics");

    // Assign topics to colleges
    await Promise.all([
      prisma.collegeTopic.createMany({
        data: [
          { collegeId: colleges[0].id, topicId: topics[0].id },
          { collegeId: colleges[0].id, topicId: topics[1].id },
          { collegeId: colleges[0].id, topicId: topics[3].id },
          { collegeId: colleges[0].id, topicId: topics[4].id },
        ],
      }),
      prisma.collegeTopic.createMany({
        data: [
          { collegeId: colleges[1].id, topicId: topics[0].id },
          { collegeId: colleges[1].id, topicId: topics[1].id },
          { collegeId: colleges[1].id, topicId: topics[2].id },
        ],
      }),
    ]);

    console.log("🔗 Assigned topics to colleges");

    // Create Assessments for some sub-topics
    const assessments = [];
    for (let i = 0; i < 5; i++) {
      // Get the topic for this sub-topic
      const subTopicWithTopic = await prisma.subTopic.findUnique({
        where: { id: subTopics[i].id },
        include: { topic: true },
      });

      const assessment = await prisma.assessment.create({
        data: {
          title: `Assessment for ${subTopics[i].title}`,
          description: `Test your knowledge of ${subTopics[i].title}`,
          type: "QUESTIONS",
          subTopicId: subTopics[i].id,
          passingScore: 60.0,
          timeLimit: 30,
          createdById: admins[0].id,
          questions: {
            create: [
              {
                topic: subTopicWithTopic.topic.title,
                subTopic: subTopics[i].title,
                questionText: `What is the main concept covered in ${subTopics[i].title}?`,
                options: JSON.stringify([
                  "Basic concepts",
                  "Advanced techniques",
                  "Practical applications",
                  "All of the above"
                ]),
                correctAnswerIndex: 3,
                explanation: "This sub-topic covers all aspects from basic to advanced concepts and practical applications.",
                timeLimitSec: 60,
              },
              {
                topic: subTopicWithTopic.topic.title,
                subTopic: subTopics[i].title,
                questionText: `Which of the following is most important for understanding ${subTopics[i].title}?`,
                options: JSON.stringify([
                  "Memorization",
                  "Understanding concepts",
                  "Practice",
                  "Both B and C"
                ]),
                correctAnswerIndex: 3,
                explanation: "Understanding concepts and practice are both essential for mastering this topic.",
                timeLimitSec: 60,
              },
            ],
          },
        },
      });
      assessments.push(assessment);
    }

    console.log("📋 Created Assessments");

    // Create some sample assessment results
    for (let i = 0; i < 5; i++) {
      const student = students[i];
      const assessment = assessments[i];
      
      await prisma.assessmentResult.create({
        data: {
          assessmentId: assessment.id,
          studentId: student.id,
          score: 75 + Math.floor(Math.random() * 20),
          total: 2,
          timeSpentSec: 120 + Math.floor(Math.random() * 60),
          passed: true,
          details: JSON.stringify([
            { questionId: 1, selectedIndex: 3, isCorrect: true },
            { questionId: 2, selectedIndex: 3, isCorrect: true },
          ]),
        },
      });
    }

    console.log("📊 Created sample assessment results");

    // Create some student progress
    for (let i = 0; i < 5; i++) {
      const student = students[i];
      const subTopic = subTopics[i];
      
      await prisma.studentTopicProgress.create({
        data: {
          studentId: student.id,
          subTopicId: subTopic.id,
          status: "COMPLETED",
          score: 80 + Math.floor(Math.random() * 15),
          attempts: 1,
          timeSpent: 300 + Math.floor(Math.random() * 120),
          lastAttemptAt: new Date(),
          unlockedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        },
      });
    }

    console.log("📈 Created student progress");

    // Create initial assessments for some students
    for (let i = 0; i < 3; i++) {
      const student = students[i];
      
      await prisma.initialAssessment.create({
        data: {
          studentId: student.id,
          score: 70 + Math.floor(Math.random() * 20),
          total: 10,
          timeSpentSec: 600 + Math.floor(Math.random() * 300),
          details: JSON.stringify([
            { questionId: 1, selectedIndex: 2, isCorrect: true },
            { questionId: 2, selectedIndex: 1, isCorrect: false },
            // ... more questions
          ]),
        },
      });
    }

    console.log("🎯 Created initial assessments");

    console.log("✅ Data seeding completed successfully!");
    console.log("\n📋 Sample Data Summary:");
    console.log(`- Colleges: ${colleges.length}`);
    console.log(`- Classes: ${classes.length}`);
    console.log(`- Users: ${1 + admins.length + administrativeUsers.length + teachers.length + students.length}`);
    console.log(`- Topics: ${topics.length}`);
    console.log(`- SubTopics: ${subTopics.length}`);
    console.log(`- Assessments: ${assessments.length}`);
    
    console.log("\n🔑 Test Credentials:");
    console.log("Super Admin: superadmin / superadmin123");
    console.log("Admin: admin1 / admin123");
    console.log("Teacher: teacher1 / teacher123");
    console.log("Student: student_abc_1 / student123");
    console.log("Administrative: admin_access_abc / adminaccess123");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  seedData()
    .then(() => {
      console.log("🎉 Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedData };
