const prisma = require("../prisma/prisma.js")

const createQuestion = async (req, res) => {
  try {
    const { topicId, subTopicId, question, options, correctAnswerIndex, correctAnswerText, explanation } = req.body;

    if (!options || options.length < 2) {
      return res.status(400).json({ message: "At least two options are required" });
    }

    const newQuestion = await prisma.question.create({
      data: {
        topicId,
        subTopicId,
        question,
        options,
        correctAnswerIndex,
        correctAnswerText,
        explanation,
        createdById: req.user.id,
      },
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error creating question", error: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctAnswerIndex, correctAnswerText, explanation } = req.body;

    // Find existing question
    const existingQuestion = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: { options: true }
    });

    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update options if provided
    if (options && options.length >= 2) {
      // Delete old options
      await prisma.option.deleteMany({ where: { questionId: Number(id) } });

      // Create new options
      await prisma.option.createMany({
        data: options.map((text, index) => ({
          text,
          isCorrect: index === correctAnswerIndex,
          questionId: Number(id)
        }))
      });
    }

    // Update question
    const updatedQuestion = await prisma.question.update({
      where: { id: Number(id) },
      data: {
        question: question || existingQuestion.question,
        correctAnswerIndex: correctAnswerIndex !== undefined ? correctAnswerIndex : existingQuestion.correctAnswerIndex,
        correctAnswerText: correctAnswerText || existingQuestion.correctAnswerText,
        explanation: explanation || existingQuestion.explanation,
      },
      include: { options: true }
    });

    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error updating question", error: error.message });
  }
};

// ✅ DELETE question (Super Admin & Admin)
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({ where: { id: Number(id) } });
    if (!existingQuestion) return res.status(404).json({ message: "Question not found" });

    // Delete question options first
    await prisma.option.deleteMany({ where: { questionId: Number(id) } });

    // Delete question
    await prisma.question.delete({ where: { id: Number(id) } });

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting question", error: error.message });
  }
};

// ✅ GET all questions
const getAllQuestions = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        topic: true,
        subTopic: true,
      },
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error: error.message });
  }
};

// ✅ GET single question
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: {
        topic: true,
        subTopic: true,
      },
    });

    if (!question) return res.status(404).json({ message: "Question not found" });

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Error fetching question", error: error.message });
  }
};

// ✅ GET questions by topic
const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const questions = await prisma.question.findMany({
      where: { topicId: Number(topicId) },
      include: { topic: true, subTopic: true },
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching topic questions", error: error.message });
  }
};

// ✅ GET questions by subTopic
const getQuestionsBySubTopic = async (req, res) => {
  try {
    const { subTopicId } = req.params;
    const questions = await prisma.question.findMany({
      where: { subTopicId: Number(subTopicId) },
      include: { topic: true, subTopic: true },
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subtopic questions", error: error.message });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  getQuestionsByTopic,
  getQuestionsBySubTopic,
  updateQuestion,
  deleteQuestion
};
