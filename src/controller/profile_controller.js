const { prisma } = require("../prisma/prisma.js");
const { sendSuccess, sendError } = require("../utils/response.js");

// Create Profile
async function createProfile(req, res) {
  const { fullname, surname, dob, college } = req.body;

  try {
    const profile = await prisma.profile.create({
      data: {
        fullname,
        surname,
        dob: new Date(dob),
        college,
        userId: req.userId
      }
    });

    await prisma.user.update({
      where: { id: req.userId },
      data: { isProfileCompleted: true }
    });

    return sendSuccess(res, "Profile created successfully", profile);
  } catch (err) {
    return sendError(res, "Profile already exists or error occurred", 400);
  }
}

// Get Profile
async function getProfile(req, res) {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.userId }
  });

  if (!profile) return sendError(res, "Profile not found", 404);

  return sendSuccess(res, "Profile fetched successfully", profile);
}

module.exports = { createProfile, getProfile };
