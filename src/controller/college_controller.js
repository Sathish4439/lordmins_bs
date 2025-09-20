const { prisma } = require("../prisma/prisma.js");
const { sendSuccess, sendError } = require("../utils/response");

// 🔹 Create College
async function createCollege(req, res) {
  const { name, location } = req.body;

  try {
    const college = await prisma.college.create({
      data: { name, location },
    });
    return sendSuccess(res, "College created successfully", college);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to create college", 400);
  }
}

// 🔹 Get All Colleges
async function getColleges(req, res) {
  try {
    const colleges = await prisma.college.findMany({
      include: { classes: true, students: true, teachers: true },
    });
    return sendSuccess(res, "Colleges fetched", colleges);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to fetch colleges", 400);
  }
}

// 🔹 Get Single College by ID
async function getCollege(req, res) {
  const { id } = req.params;

  try {
    const college = await prisma.college.findUnique({
      where: { id: parseInt(id) },
      include: { classes: true, students: true, teachers: true },
    });

    if (!college) return sendError(res, "College not found", 404);

    return sendSuccess(res, "College fetched", college);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to fetch college", 400);
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
    });
    return sendSuccess(res, "College updated successfully", college);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to update college", 400);
  }
}

// 🔹 Delete College
async function deleteCollege(req, res) {
  const { id } = req.params;

  try {
    await prisma.college.delete({ where: { id: parseInt(id) } });
    return sendSuccess(res, "College deleted successfully", null);
  } catch (err) {
    console.error(err);
    return sendError(res, "Failed to delete college", 400);
  }
}

module.exports = {
  createCollege,
  getColleges,
  getCollege,
  updateCollege,
  deleteCollege,
};
