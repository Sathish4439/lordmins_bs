const { prisma } = require("../prisma/prisma.js");
const { sendSuccess, sendError } = require("../utils/response");

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
  const { collegeId, classId, type, subTopicId } = req.query;

  try {
    const where = {
      ...(collegeId && { collegeId: parseInt(collegeId) }),
      ...(classId && { classId: parseInt(classId) }),
      ...(type && { type }),
      ...(subTopicId && { subTopicId: parseInt(subTopicId) }),
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

// 🔹 Get Assessment by ID
async function getAssessmentById(req, res) {
  const { assessmentId } = req.params;

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: parseInt(assessmentId) },
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
        results: {
          include: {
            student: {
              include: {
                college: true,
                class: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!assessment) {
      return sendError(res, "Assessment not found", 404);
    }

    return sendSuccess(res, "Assessment retrieved successfully", assessment);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve assessment", 500);
  }
}

// 🔹 Update Assessment
async function updateAssessment(req, res) {
  const { assessmentId } = req.params;
  const {
    title,
    description,
    type,
    passingScore,
    timeLimit,
    isActive,
  } = req.body;

  try {
    const assessment = await prisma.assessment.update({
      where: { id: parseInt(assessmentId) },
      data: {
        title,
        description,
        type,
        passingScore,
        timeLimit,
        isActive,
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

    return sendSuccess(res, "Assessment updated successfully", assessment);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update assessment", 500);
  }
}

// 🔹 Delete Assessment
async function deleteAssessment(req, res) {
  const { assessmentId } = req.params;

  try {
    await prisma.assessment.delete({
      where: { id: parseInt(assessmentId) },
    });

    return sendSuccess(res, "Assessment deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete assessment", 500);
  }
}

// 🔹 Add Questions to Assessment
async function addQuestions(req, res) {
  const { assessmentId } = req.params;
  const { questions } = req.body;

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: parseInt(assessmentId) },
    });

    if (!assessment) {
      return sendError(res, "Assessment not found", 404);
    }

    const createdQuestions = await prisma.question.createMany({
      data: questions.map((question) => ({
        ...question,
        assessmentId: parseInt(assessmentId),
      })),
    });

    return sendSuccess(res, "Questions added successfully", {
      count: createdQuestions.count,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to add questions", 500);
  }
}

// 🔹 Update Question
async function updateQuestion(req, res) {
  const { questionId } = req.params;
  const {
    questionText,
    options,
    correctAnswerIndex,
    explanation,
    timeLimitSec,
    isVoiceRecognition,
  } = req.body;

  try {
    const question = await prisma.question.update({
      where: { id: parseInt(questionId) },
      data: {
        questionText,
        options: JSON.stringify(options),
        correctAnswerIndex,
        explanation,
        timeLimitSec,
        isVoiceRecognition,
      },
    });

    return sendSuccess(res, "Question updated successfully", question);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update question", 500);
  }
}

// 🔹 Delete Question
async function deleteQuestion(req, res) {
  const { questionId } = req.params;

  try {
    await prisma.question.delete({
      where: { id: parseInt(questionId) },
    });

    return sendSuccess(res, "Question deleted successfully");
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete question", 500);
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

// 🔹 Get Student Assessment Results
async function getStudentAssessmentResults(req, res) {
  const { studentId } = req.params;
  const { assessmentId } = req.query;

  try {
    const where = {
      studentId: parseInt(studentId),
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

    return sendSuccess(res, "Student assessment results retrieved successfully", results);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve student assessment results", 500);
  }
}

// 🔹 Submit Assessment
async function submitAssessment(req, res) {
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

    // Update student progress if assessment is linked to a sub-topic
    if (assessment.subTopicId) {
      await updateStudentProgress(userId, assessment.subTopicId, score, timeSpent, passed);
    }

    return sendSuccess(res, "Assessment submitted successfully", {
      score,
      total: totalQuestions,
      percentage: score,
      passed,
      result,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to submit assessment", 500);
  }
}

// 🔹 Get Assessment Statistics
async function getAssessmentStatistics(req, res) {
  const { assessmentId } = req.params;

  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: parseInt(assessmentId) },
      include: {
        results: true,
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    if (!assessment) {
      return sendError(res, "Assessment not found", 404);
    }

    const stats = {
      totalAttempts: assessment._count.results,
      averageScore: 0,
      passRate: 0,
      totalStudents: 0,
    };

    if (assessment.results.length > 0) {
      const totalScore = assessment.results.reduce((sum, result) => sum + result.score, 0);
      const passedCount = assessment.results.filter((result) => result.passed).length;
      const uniqueStudents = new Set(assessment.results.map((result) => result.studentId)).size;

      stats.averageScore = totalScore / assessment.results.length;
      stats.passRate = (passedCount / assessment.results.length) * 100;
      stats.totalStudents = uniqueStudents;
    }

    return sendSuccess(res, "Assessment statistics retrieved successfully", {
      assessment: {
        id: assessment.id,
        title: assessment.title,
        type: assessment.type,
        passingScore: assessment.passingScore,
      },
      statistics: stats,
    });
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve assessment statistics", 500);
  }
}

// Helper function to update student progress
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
  } else {
    await prisma.studentTopicProgress.create({
      data: {
        studentId: userId,
        subTopicId: subTopicId,
        score,
        attempts: 1,
        timeSpent,
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

// Helper function to unlock next sub-topic
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
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  addQuestions,
  updateQuestion,
  deleteQuestion,
  getAssessmentResults,
  getStudentAssessmentResults,
  submitAssessment,
  getAssessmentStatistics,
};
