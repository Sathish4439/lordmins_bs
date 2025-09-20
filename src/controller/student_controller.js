const { prisma } = require("../prisma/prisma.js");
const { sendSuccess, sendError } = require("../utils/response");

// 🔹 Get Student Profile
async function getProfile(req, res) {
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        college: true,
        class: true,
        student: true,
        initialAssessment: true,
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

// 🔹 Get Available Topics
async function getAvailableTopics(req, res) {
  const { userId } = req.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        college: {
          include: {
            topics: {
              where: { isActive: true },
              include: {
                topic: {
                  include: {
                    subTopics: {
                      include: {
                        assessment: true,
                      },
                    },
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

    // Get student's progress for each topic
    const studentProgress = await prisma.studentTopicProgress.findMany({
      where: { studentId: userId },
      include: {
        subTopic: {
          include: {
            topic: true,
          },
        },
      },
    });

    // Map progress to topics
    const topicsWithProgress = user.college.topics.map((collegeTopic) => {
      const topic = collegeTopic.topic;
      const subTopicsWithProgress = topic.subTopics.map((subTopic) => {
        const progress = studentProgress.find(
          (p) => p.subTopicId === subTopic.id
        );
        return {
          ...subTopic,
          progress: progress || {
            status: "LOCKED",
            score: null,
            attempts: 0,
            timeSpent: 0,
          },
        };
      });

      return {
        ...topic,
        subTopics: subTopicsWithProgress,
      };
    });

    return sendSuccess(res, "Available topics retrieved successfully", topicsWithProgress);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve topics", 500);
  }
}

// 🔹 Get Topic Details
async function getTopicDetails(req, res) {
  const { topicId } = req.params;
  const { userId } = req.user;

  try {
    const topic = await prisma.topic.findUnique({
      where: { id: parseInt(topicId) },
      include: {
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
      },
    });

    if (!topic) {
      return sendError(res, "Topic not found", 404);
    }

    // Get student's progress for this topic
    const studentProgress = await prisma.studentTopicProgress.findMany({
      where: {
        studentId: userId,
        subTopic: {
          topicId: parseInt(topicId),
        },
      },
    });

    // Map progress to sub-topics
    const subTopicsWithProgress = topic.subTopics.map((subTopic) => {
      const progress = studentProgress.find(
        (p) => p.subTopicId === subTopic.id
      );
      return {
        ...subTopic,
        progress: progress || {
          status: "LOCKED",
          score: null,
          attempts: 0,
          timeSpent: 0,
        },
      };
    });

    return sendSuccess(res, "Topic details retrieved successfully", {
      ...topic,
      subTopics: subTopicsWithProgress,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve topic details", 500);
  }
}

// 🔹 Get SubTopic Details
async function getSubTopicDetails(req, res) {
  const { subTopicId } = req.params;
  const { userId } = req.user;

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

    // Get student's progress for this sub-topic
    const progress = await prisma.studentTopicProgress.findUnique({
      where: {
        studentId_subTopicId: {
          studentId: userId,
          subTopicId: parseInt(subTopicId),
        },
      },
    });

    return sendSuccess(res, "Sub-topic details retrieved successfully", {
      ...subTopic,
      progress: progress || {
        status: "LOCKED",
        score: null,
        attempts: 0,
        timeSpent: 0,
      },
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve sub-topic details", 500);
  }
}

// 🔹 Take Initial Assessment
async function takeInitialAssessment(req, res) {
  const { userId } = req.user;
  const { answers, timeSpent } = req.body;

  try {
    // Check if student already took initial assessment
    const existingAssessment = await prisma.initialAssessment.findUnique({
      where: { studentId: userId },
    });

    if (existingAssessment) {
      return sendError(res, "Initial assessment already completed", 400);
    }

    // Calculate score (this would depend on your assessment logic)
    const totalQuestions = answers.length;
    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const score = (correctAnswers / totalQuestions) * 100;

    // Create initial assessment record
    const initialAssessment = await prisma.initialAssessment.create({
      data: {
        studentId: userId,
        score,
        total: totalQuestions,
        timeSpentSec: timeSpent,
        details: JSON.stringify(answers),
      },
    });

    // Based on the score, unlock appropriate topics
    // This logic would depend on your business rules
    await unlockTopicsBasedOnScore(userId, score);

    return sendSuccess(res, "Initial assessment completed successfully", {
      score,
      total: totalQuestions,
      percentage: score,
      initialAssessment,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to complete initial assessment", 500);
  }
}

// 🔹 Take Assessment
async function takeAssessment(req, res) {
  const { assessmentId } = req.params;
  const { userId } = req.user;
  const { answers, timeSpent } = req.body;

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: parseInt(assessmentId) },
      include: {
        questions: true,
        subTopic: true,
      },
    });

    if (!assessment) {
      return sendError(res, "Assessment not found", 404);
    }

    // Calculate score
    const totalQuestions = assessment.questions.length;
    const correctAnswers = answers.filter((answer) => {
      const question = assessment.questions.find((q) => q.id === answer.questionId);
      return question && question.correctAnswerIndex === answer.selectedIndex;
    }).length;

    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= assessment.passingScore;

    // Create assessment result
    const result = await prisma.assessmentResult.create({
      data: {
        assessmentId: parseInt(assessmentId),
        studentId: userId,
        score,
        total: totalQuestions,
        timeSpentSec: timeSpent,
        passed,
        details: JSON.stringify(answers),
      },
    });

    // Update student progress
    if (assessment.subTopicId) {
      await updateStudentProgress(userId, assessment.subTopicId, score, timeSpent, passed);
    }

    return sendSuccess(res, "Assessment completed successfully", {
      score,
      total: totalQuestions,
      percentage: score,
      passed,
      result,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to complete assessment", 500);
  }
}

// 🔹 Get Assessment Results
async function getAssessmentResults(req, res) {
  const { userId } = req.user;
  const { assessmentId } = req.query;

  try {
    const where = {
      studentId: userId,
      ...(assessmentId && { assessmentId: parseInt(assessmentId) }),
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
  const { userId } = req.user;

  try {
    const progress = await prisma.studentTopicProgress.findMany({
      where: { studentId: userId },
      include: {
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
  const { userId } = req.user;

  try {
    const [
      totalTopics,
      completedTopics,
      totalAssessments,
      completedAssessments,
      averageScore,
      totalTimeSpent,
    ] = await Promise.all([
      prisma.studentTopicProgress.count({
        where: { studentId: userId },
      }),
      prisma.studentTopicProgress.count({
        where: {
          studentId: userId,
          status: "COMPLETED",
        },
      }),
      prisma.assessmentResult.count({
        where: { studentId: userId },
      }),
      prisma.assessmentResult.count({
        where: {
          studentId: userId,
          passed: true,
        },
      }),
      prisma.assessmentResult.aggregate({
        where: { studentId: userId },
        _avg: { score: true },
      }),
      prisma.studentTopicProgress.aggregate({
        where: { studentId: userId },
        _sum: { timeSpent: true },
      }),
    ]);

    return sendSuccess(res, "Dashboard data retrieved successfully", {
      stats: {
        totalTopics,
        completedTopics,
        totalAssessments,
        completedAssessments,
        averageScore: averageScore._avg.score || 0,
        totalTimeSpent: totalTimeSpent._sum.timeSpent || 0,
      },
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve dashboard data", 500);
  }
}

// Helper functions
async function unlockTopicsBasedOnScore(userId, score) {
  // This is a simplified logic - you would implement your business rules here
  // For example, unlock topics based on score ranges
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      college: {
        include: {
          topics: {
            include: {
              topic: {
                include: {
                  subTopics: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.college) return;

  // Example: Unlock first 3 topics if score > 70%
  const topicsToUnlock = user.college.topics.slice(0, 3);
  
  for (const collegeTopic of topicsToUnlock) {
    for (const subTopic of collegeTopic.topic.subTopics) {
      await prisma.studentTopicProgress.upsert({
        where: {
          studentId_subTopicId: {
            studentId: userId,
            subTopicId: subTopic.id,
          },
        },
        update: {
          status: "UNLOCKED",
          unlockedAt: new Date(),
        },
        create: {
          studentId: userId,
          subTopicId: subTopic.id,
          status: "UNLOCKED",
          unlockedAt: new Date(),
        },
      });
    }
  }
}

async function updateStudentProgress(userId, subTopicId, score, timeSpent, passed) {
  const progress = await prisma.studentTopicProgress.findUnique({
    where: {
      studentId_subTopicId: {
        studentId: userId,
        subTopicId: subTopicId,
      },
    },
  });

  if (progress) {
    await prisma.studentTopicProgress.update({
      where: {
        studentId_subTopicId: {
          studentId: userId,
          subTopicId: subTopicId,
        },
      },
      data: {
        score: Math.max(progress.score || 0, score),
        attempts: progress.attempts + 1,
        timeSpent: progress.timeSpent + timeSpent,
        lastAttemptAt: new Date(),
        status: passed ? "COMPLETED" : "UNLOCKED",
      },
    });
  }

  // Unlock next sub-topic if current one is completed
  if (passed) {
    await unlockNextSubTopic(userId, subTopicId);
  }
}

async function unlockNextSubTopic(userId, currentSubTopicId) {
  const currentSubTopic = await prisma.subTopic.findUnique({
    where: { id: currentSubTopicId },
    include: {
      topic: {
        include: {
          subTopics: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!currentSubTopic) return;

  const nextSubTopic = currentSubTopic.topic.subTopics.find(
    (st) => st.order === currentSubTopic.order + 1
  );

  if (nextSubTopic) {
    await prisma.studentTopicProgress.upsert({
      where: {
        studentId_subTopicId: {
          studentId: userId,
          subTopicId: nextSubTopic.id,
        },
      },
      update: {
        status: "UNLOCKED",
        unlockedAt: new Date(),
      },
      create: {
        studentId: userId,
        subTopicId: nextSubTopic.id,
        status: "UNLOCKED",
        unlockedAt: new Date(),
      },
    });
  }
}

module.exports = {
  getProfile,
  getAvailableTopics,
  getTopicDetails,
  getSubTopicDetails,
  takeInitialAssessment,
  takeAssessment,
  getAssessmentResults,
  getStudentProgress,
  getDashboardData,
};
