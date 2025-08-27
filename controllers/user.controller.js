const logger = require("../utils/logger");
const sendResponse = require("../utils/sendResponse");
const ApiError = require("../utils/apiError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const User = require("../models/users.models");

const getProfile = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId)

  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  sendResponse(res, 200, "success", "User profile retrieved successfully", {
    user: { 
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role.name, 
    },
  });
});

async function getAllUsers(req, res) {
  try {
    const users = await User.find({}, '-password -passwordResetTokenHash');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Validates an email address using a regular expression.
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidEmail(email) {
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}


module.exports = {
  getProfile,
getAllUsers
}
