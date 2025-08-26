const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ApiError = require("../utils/apiError");
const Pin = require("../models/pin.model");
const Board = require("../models/board.model");
const sendResponse = require("../utils/sendResponse");

// Create a new pin
const createPin = asyncErrorHandler(async (req, res, next) => {
  const { title, description, imageUrl, board, tags } = req.body;
  const userId = req.user.id;
  console.log(userId)

  // Find the board
  const boardDoc = await Board.findById(board);
  if (!boardDoc) {
    return next(new ApiError("Board not found", 404));
  }

  // Optional ownership check
  if (boardDoc.createdBy.toString() !== userId) {
    return next(new ApiError("You do not own this board", 403));
  }

  // Create the pin
  const newPin = new Pin({
    title,
    description,
    imageUrl,
    createdBy: userId,
    board,
    tags,
  });

  await newPin.save();

  // Push the pin ID into the board's pins array
  boardDoc.pins.push(newPin._id);
  await boardDoc.save();

  sendResponse(res, 201, "success", "Pin created successfully", {
    pin: newPin,
  });
});

// Get pin by ID
const getPinById = asyncErrorHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id).populate(
    "createdBy",
    "username avatar"
  );
  if (!pin) return next(new ApiError("Pin not found", 404));

  pin.analytics.views += 1;
  await pin.save();

  sendResponse(res, 200, "success", "Pin retrieved successfully", { pin });
});

// Repin
const repin = asyncErrorHandler(async (req, res, next) => {
  const { board } = req.body;
  const userId = req.user.id;
  const originalPin = await Pin.findById(req.params.id);
  if (!originalPin) return next(new ApiError("Original pin not found", 404));

  const boardDoc = await Board.findById(board);
  if (!boardDoc) return next(new ApiError("Board not found", 404));

  const newPin = new Pin({
    title: originalPin.title,
    description: originalPin.description,
    imageUrl: originalPin.imageUrl,
    createdBy: userId,
    board,
    tags: originalPin.tags,
    repinFrom: originalPin._id,
  });

  await newPin.save();
  originalPin.analytics.saves += 1;
  await originalPin.save();

  sendResponse(res, 201, "success", "Pin repinned successfully", {
    pin: newPin,
  });
});

// Get pins with pagination & search
const getPins = asyncErrorHandler(async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = search ? { $text: { $search: search } } : {};

  const pins = await Pin.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate("createdBy", "username avatar")
    .sort({ createdAt: -1 });

  const totalPins = await Pin.countDocuments(query);
  const totalPages = Math.ceil(totalPins / limit);

  sendResponse(res, 200, "success", "Pins retrieved successfully", {
    pins,
    pagination: { totalPins, totalPages, currentPage: parseInt(page) },
  });
});

// Update pin
const updatePin = asyncErrorHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id);
  if (!pin) return next(new ApiError("Pin not found", 404));
  if (pin.createdBy.toString() !== req.user.id)
    return next(new ApiError("You do not own this pin", 403));

  const { title, description, imageUrl, tags } = req.body;
  if (title) pin.title = title;
  if (description) pin.description = description;
  if (imageUrl) pin.imageUrl = imageUrl;
  if (tags) pin.tags = tags;

  await pin.save();
  sendResponse(res, 200, "success", "Pin updated successfully", { pin });
});

// Delete pin
const deletePin = asyncErrorHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id);
  if (!pin) return next(new ApiError("Pin not found", 404));
  if (pin.createdBy.toString() !== req.user.id)
    return next(new ApiError("You do not own this pin", 403));

  await pin.remove();
  sendResponse(res, 200, "success", "Pin deleted successfully");
});

// Toggle like
const toggleLikePin = asyncErrorHandler(async (req, res, next) => {
  const pin = await Pin.findById(req.params.id);
  if (!pin) return next(new ApiError("Pin not found", 404));

  const userId = req.user.id;
  if (pin.likes.includes(userId)) pin.likes.pull(userId);
  else pin.likes.push(userId);

  await pin.save();
  sendResponse(res, 200, "success", "Pin like status toggled successfully", {
    likesCount: pin.likes.length,
  });
});

module.exports = {
  createPin,
  getPinById,
  repin,
  getPins,
  updatePin,
  deletePin,
  toggleLikePin,
};
