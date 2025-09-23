const { prisma } = require("../prisma/prisma.js");
const { sendSuccess, sendError } = require("../utils/response");

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
            videoFile: true,
          },
          orderBy: { order: "asc" },
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

// 🔹 Get Topic by ID
async function getTopicById(req, res) {
  const { topicId } = req.params;

  try {
    const topic = await prisma.topic.findUnique({
      where: { id: parseInt(topicId) },
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
            assessment: {
              include: {
                questions: true,
              },
            },
            videoFile: true,
          },
          orderBy: { order: "asc" },
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
    });

    if (!topic) {
      return sendError(res, "Topic not found", 404);
    }

    return sendSuccess(res, "Topic retrieved successfully", topic);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve topic", 500);
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
  const { topicId } = req.params;
  const { title, description, order, isActive } = req.body;

  try {
    const topic = await prisma.topic.update({
      where: { id: parseInt(topicId) },
      data: {
        title,
        description,
        order,
        isActive,
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
  const { topicId } = req.params;

  try {
    await prisma.topic.delete({
      where: { id: parseInt(topicId) },
    });

    return sendSuccess(res, "Topic deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete topic", 500);
  }
}

// 🔹 Create SubTopic
async function createSubTopic(req, res) {
  const { topicId } = req.params;
  const { title, contentText, videoFileId, imageFileIds, order } = req.body;

  try {
    const subTopic = await prisma.subTopic.create({
      data: {
        topicId: parseInt(topicId),
        title,
        contentText,
        videoFileId: videoFileId || null,
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

// 🔹 Get SubTopic by ID
async function getSubTopicById(req, res) {
  const { subTopicId } = req.params;

  try {
    const subTopic = await prisma.subTopic.findUnique({
      where: { id: parseInt(subTopicId) },
      include: {
        topic: true,
        assessment: {
          include: {
            questions: true,
          },
        },
        videoFile: true,
      },
    });

    if (!subTopic) {
      return sendError(res, "Sub-topic not found", 404);
    }

    return sendSuccess(res, "Sub-topic retrieved successfully", subTopic);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve sub-topic", 500);
  }
}

// 🔹 Update SubTopic
async function updateSubTopic(req, res) {
  const { subTopicId } = req.params;
  const { title, contentText, videoFileId, imageFileIds, order, isActive } =
    req.body;

  try {
    const subTopic = await prisma.subTopic.update({
      where: { id: parseInt(subTopicId) },
      data: {
        title,
        contentText,
        videoFileId,
        imageFileIds: imageFileIds ? JSON.stringify(imageFileIds) : null,
        order,
        isActive,
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

// 🔹 Delete SubTopic
async function deleteSubTopic(req, res) {
  const { subTopicId } = req.params;

  try {
    await prisma.subTopic.delete({
      where: { id: parseInt(subTopicId) },
    });

    return sendSuccess(res, "Sub-topic deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete sub-topic", 500);
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

// 🔹 Get College Topics
async function getCollegeTopics(req, res) {
  const { collegeId } = req.params;

  try {
    const college = await prisma.college.findUnique({
      where: { id: parseInt(collegeId) },
      include: {
        topics: {
          where: { isActive: true },
          include: {
            topic: {
              include: {
                subTopics: {
                  include: {
                    assessment: true,
                    videoFile: true,
                  },
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!college) {
      return sendError(res, "College not found", 404);
    }

    return sendSuccess(
      res,
      "College topics retrieved successfully",
      college.topics
    );
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve college topics", 500);
  }
}

// 🔹 Get Student Topics with Progress
async function getStudentTopicsWithProgress(req, res) {
  const { studentId } = req.params;
  const { collegeId } = req.query;

  try {
    const student = await prisma.user.findUnique({
      where: { id: parseInt(studentId) },
      include: {
        college: true,
        class: true,
      },
    });

    if (!student) {
      return sendError(res, "Student not found", 404);
    }

    // Get college topics
    const collegeTopics = await prisma.collegeTopic.findMany({
      where: {
        collegeId: collegeId ? parseInt(collegeId) : student.collegeId,
        isActive: true,
      },
      include: {
        topic: {
          include: {
            subTopics: {
              include: {
                assessment: true,
                videoFile: true,
                progress: {
                  where: { studentId: parseInt(studentId) },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    // Get student's initial assessment score
    const initialAssessment = await prisma.initialAssessment.findUnique({
      where: { studentId: parseInt(studentId) },
    });

    // Process topics with unlocking logic
    const topicsWithProgress = collegeTopics.map((collegeTopic) => {
      const topic = collegeTopic.topic;
      const subTopicsWithStatus = topic.subTopics.map((subTopic) => {
        const progress = subTopic.progress[0];
        let status = "LOCKED";

        // Check if student has completed initial assessment
        if (!initialAssessment) {
          status = "LOCKED";
        } else {
          // Check topic unlock rules
          const unlockRule = topic.unlockRules?.find(
            (rule) => !rule.collegeId || rule.collegeId === student.collegeId
          );

          if (unlockRule) {
            // Check if required score is met
            if (initialAssessment.score >= unlockRule.requiredScore) {
              // Check if required topics are completed
              const requiredTopics = unlockRule.requiredTopics
                ? JSON.parse(unlockRule.requiredTopics)
                : [];

              if (
                requiredTopics.length === 0 ||
                requiredTopics.every((reqTopicId) =>
                  isTopicCompleted(studentId, reqTopicId)
                )
              ) {
                status = progress ? progress.status : "UNLOCKED";
              }
            }
          } else {
            // Default unlocking logic - unlock first topic
            if (topic.order === 1) {
              status = progress ? progress.status : "UNLOCKED";
            } else {
              // Check if previous topic is completed
              const previousTopicCompleted = isPreviousTopicCompleted(
                studentId,
                topic.order - 1,
                student.collegeId
              );
              if (previousTopicCompleted) {
                status = progress ? progress.status : "UNLOCKED";
              }
            }
          }
        }

        return {
          ...subTopic,
          status,
          progress: progress || null,
        };
      });

      return {
        ...topic,
        subTopics: subTopicsWithStatus,
        isUnlocked: subTopicsWithStatus.some((st) => st.status !== "LOCKED"),
      };
    });

    return sendSuccess(
      res,
      "Student topics with progress retrieved successfully",
      {
        student: {
          id: student.id,
          name: student.name,
          rollNo: student.rollNo,
          college: student.college,
          class: student.class,
        },
        initialAssessment,
        topics: topicsWithProgress,
      }
    );
  } catch (err) {
    console.error(err);
    return sendError(
      res,
      "Failed to retrieve student topics with progress",
      500
    );
  }
}

// 🔹 Create Topic Unlock Rule
async function createTopicUnlockRule(req, res) {
  const { topicId, collegeId, requiredScore, requiredTopics } = req.body;
  const { userId } = req.user;

  try {
    const unlockRule = await prisma.topicUnlockRule.create({
      data: {
        topicId: parseInt(topicId),
        collegeId: collegeId ? parseInt(collegeId) : null,
        requiredScore: requiredScore || 60.0,
        requiredTopics: requiredTopics ? JSON.stringify(requiredTopics) : null,
      },
      include: {
        topic: true,
        college: true,
      },
    });

    return sendSuccess(
      res,
      "Topic unlock rule created successfully",
      unlockRule
    );
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create topic unlock rule", 500);
  }
}

// 🔹 Update Topic Unlock Rule
async function updateTopicUnlockRule(req, res) {
  const { ruleId } = req.params;
  const { requiredScore, requiredTopics, isActive } = req.body;

  try {
    const unlockRule = await prisma.topicUnlockRule.update({
      where: { id: parseInt(ruleId) },
      data: {
        requiredScore,
        requiredTopics: requiredTopics ? JSON.stringify(requiredTopics) : null,
        isActive,
      },
      include: {
        topic: true,
        college: true,
      },
    });

    return sendSuccess(
      res,
      "Topic unlock rule updated successfully",
      unlockRule
    );
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update topic unlock rule", 500);
  }
}

// 🔹 Get Topic Unlock Rules
async function getTopicUnlockRules(req, res) {
  const { topicId, collegeId } = req.query;

  try {
    const where = {
      ...(topicId && { topicId: parseInt(topicId) }),
      ...(collegeId && { collegeId: parseInt(collegeId) }),
    };

    const unlockRules = await prisma.topicUnlockRule.findMany({
      where,
      include: {
        topic: true,
        college: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return sendSuccess(
      res,
      "Topic unlock rules retrieved successfully",
      unlockRules
    );
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve topic unlock rules", 500);
  }
}

// 🔹 Submit Initial Assessment
async function submitInitialAssessment(req, res) {
  const { studentId } = req.params;
  const { answers, timeSpent } = req.body;

  try {
    const student = await prisma.user.findUnique({
      where: { id: parseInt(studentId) },
    });

    if (!student || student.role !== "STUDENT") {
      return sendError(res, "Student not found", 404);
    }

    // Check if initial assessment already exists
    const existingAssessment = await prisma.initialAssessment.findUnique({
      where: { studentId: parseInt(studentId) },
    });

    if (existingAssessment) {
      return sendError(res, "Initial assessment already completed", 400);
    }

    // Calculate score (simplified - you might want to implement proper scoring)
    const totalQuestions = answers.length;
    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const score = (correctAnswers / totalQuestions) * 100;

    // Create initial assessment record
    const initialAssessment = await prisma.initialAssessment.create({
      data: {
        studentId: parseInt(studentId),
        score,
        total: totalQuestions,
        timeSpentSec: timeSpent,
        details: JSON.stringify(answers),
      },
    });

    // Unlock topics based on initial assessment score
    await unlockTopicsBasedOnInitialAssessment(
      studentId,
      score,
      student.collegeId
    );

    return sendSuccess(res, "Initial assessment submitted successfully", {
      score,
      total: totalQuestions,
      percentage: score,
      initialAssessment,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to submit initial assessment", 500);
  }
}

// Helper function to check if topic is completed
async function isTopicCompleted(studentId, topicId) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      subTopics: {
        include: {
          progress: {
            where: { studentId },
          },
        },
      },
    },
  });

  if (!topic) return false;

  // Check if all sub-topics are completed
  return topic.subTopics.every((subTopic) => {
    const progress = subTopic.progress[0];
    return progress && progress.status === "COMPLETED";
  });
}

// Helper function to check if previous topic is completed
async function isPreviousTopicCompleted(studentId, topicOrder, collegeId) {
  const previousTopic = await prisma.collegeTopic.findFirst({
    where: {
      collegeId,
      topic: { order: topicOrder },
    },
    include: {
      topic: {
        include: {
          subTopics: {
            include: {
              progress: {
                where: { studentId },
              },
            },
          },
        },
      },
    },
  });

  if (!previousTopic) return false;

  // Check if all sub-topics of previous topic are completed
  return previousTopic.topic.subTopics.every((subTopic) => {
    const progress = subTopic.progress[0];
    return progress && progress.status === "COMPLETED";
  });
}

// Helper function to unlock topics based on initial assessment
async function unlockTopicsBasedOnInitialAssessment(
  studentId,
  score,
  collegeId
) {
  // Get all college topics
  const collegeTopics = await prisma.collegeTopic.findMany({
    where: { collegeId },
    include: {
      topic: {
        include: {
          subTopics: true,
          unlockRules: {
            where: {
              OR: [{ collegeId: null }, { collegeId }],
            },
          },
        },
      },
    },
  });

  // Process each topic
  for (const collegeTopic of collegeTopics) {
    const topic = collegeTopic.topic;
    const unlockRule = topic.unlockRules[0];

    let shouldUnlock = false;

    if (unlockRule) {
      // Check if score meets requirement
      if (score >= unlockRule.requiredScore) {
        // Check if required topics are completed
        const requiredTopics = unlockRule.requiredTopics
          ? JSON.parse(unlockRule.requiredTopics)
          : [];

        if (requiredTopics.length === 0) {
          shouldUnlock = true;
        } else {
          const allRequiredCompleted = await Promise.all(
            requiredTopics.map((reqTopicId) =>
              isTopicCompleted(studentId, reqTopicId)
            )
          );
          shouldUnlock = allRequiredCompleted.every((completed) => completed);
        }
      }
    } else {
      // Default logic - unlock first topic
      shouldUnlock = topic.order === 1;
    }

    if (shouldUnlock) {
      // Unlock first sub-topic of this topic
      const firstSubTopic = topic.subTopics.find((st) => st.order === 1);
      if (firstSubTopic) {
        await prisma.studentTopicProgress.upsert({
          where: {
            studentId_subTopicId: {
              studentId,
              subTopicId: firstSubTopic.id,
            },
          },
          update: {
            status: "UNLOCKED",
            unlockedAt: new Date(),
          },
          create: {
            studentId,
            subTopicId: firstSubTopic.id,
            status: "UNLOCKED",
            unlockedAt: new Date(),
          },
        });
      }
    }
  }
}

module.exports = {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  createSubTopic,
  getSubTopicById,
  updateSubTopic,
  deleteSubTopic,
  assignTopicsToCollege,
  getCollegeTopics,
  getStudentTopicsWithProgress,
  createTopicUnlockRule,
  updateTopicUnlockRule,
  getTopicUnlockRules,
  submitInitialAssessment,
};
