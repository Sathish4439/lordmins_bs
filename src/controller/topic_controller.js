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
  const { title, contentText, videoFileId, imageFileIds, order, isActive } = req.body;

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

    return sendSuccess(res, "College topics retrieved successfully", college.topics);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to retrieve college topics", 500);
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
};
