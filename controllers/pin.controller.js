const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ApiError = require("../utils/apiError");
const User = require("../models/users.models");
const sendResponse = require("../utils/sendResponse");
const logger = require("../utils/logger");

const Pin = require("../models/pin.model");
const Board = require("../models/board.model");


const createPin = asyncErrorHandler(async (req, res, next) => {
  const { title, description, imageUrl, boardId, tags } = req.body;
  const userId = req.user.id;

  const board = await Board.findById(boardId);
  if (!board) {
    return next(new ApiError("Board not found", 404));
  }
  if (board.createdBy.toString() !== userId) {
    return next(new ApiError("You do not own this board", 403));
  }

  const newPin = new Pin({
    title,
    description,
    imageUrl,
    createdBy: userId,
    board: boardId,
    tags,
  });

  await newPin.save();

  sendResponse(res, 201, "success", "Pin created successfully", { pin: newPin });
});

const getPinById = asyncErrorHandler(async (req, res, next) => {
  const pinId = req.params.id;

  const pin = await Pin.findById(pinId).populate("createdBy", "username avatar");
  if (!pin) {
    return next(new ApiError("Pin not found", 404));
  }

  // Increment view count
  pin.analytics.views += 1;
  await pin.save();

  sendResponse(res, 200, "success", "Pin retrieved successfully", { pin });
});

const repin = asyncErrorHandler(async (req, res, next) => {
  const pinId = req.params.id;
  const { boardId } = req.body;
  const userId = req.user.id;

  const originalPin = await Pin.findById(pinId);
  if (!originalPin) {
    return next(new ApiError("Original pin not found", 404));
  }

  const board = await Board.findById(boardId);
  if (!board) {
    return next(new ApiError("Board not found", 404));
  }
  if (board.createdBy.toString() !== userId) {
    return next(new ApiError("You do not own this board", 403));
  }

  const newPin = new Pin({
    title: originalPin.title,
    description: originalPin.description,
    imageUrl: originalPin.imageUrl,
    createdBy: userId,
    board: boardId,
    tags: originalPin.tags,
    repinFrom: originalPin._id,
  });

  await newPin.save();

  // Increment save count on original pin
  originalPin.analytics.saves += 1;
  await originalPin.save();

  sendResponse(res, 201, "success", "Pin repinned successfully", { pin: newPin });
});


const getPins = asyncErrorHandler(async (req, res, next) => {
    const { page = 1, limit = 10, search } = req.query;
    const query = search
        ? { $text: { $search: search } }
        : {};
    
    const pins = await Pin.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("createdBy", "username avatar")
        .sort({ createdAt: -1 });
    
    const totalPins = await Pin.countDocuments(query);
    const totalPages = Math.ceil(totalPins / limit);
    
    sendResponse(res, 200, "success", "Pins retrieved successfully", {
        pins,
        pagination: {
        totalPins,
        totalPages,
        currentPage: parseInt(page),
        },
    });
});

const updatePin = asyncErrorHandler(async (req, res, next) => {
  const pinId = req.params.id;
  const userId = req.user.id;
  const { title, description, imageUrl, tags } = req.body;

  const pin = await Pin.findById(pinId);
    if (!pin) {
        return next(new ApiError("Pin not found", 404));
    }
    if (pin.createdBy.toString() !== userId) {
        return next(new ApiError("You do not own this pin", 403));
    }
    if (title) pin.title = title;
    if (description) pin.description = description;
    if (imageUrl) pin.imageUrl = imageUrl;
    if (tags) pin.tags = tags;  
    await pin.save();

    sendResponse(res, 200, "success", "Pin updated successfully", { pin });
});


const deletePin = asyncErrorHandler(async (req, res, next) => {
  const pinId = req.params.id;
  const userId = req.user.id;

  const pin = await Pin.findById(pinId);
    if (!pin) {
        return next(new ApiError("Pin not found", 404));
    }
    if (pin.createdBy.toString() !== userId) {
        return next(new ApiError("You do not own this pin", 403));
    }   
    await pin.remove();
    sendResponse(res, 200, "success", "Pin deleted successfully");
});


// const likePin = asyncErrorHandler(async (req, res, next) => {
//   const pinId = req.params.id;
//   const userId = req.user.id;

//   const pin = await Pin.findById(pinId);
//     if (!pin) { 
//         return next(new ApiError("Pin not found", 404));
//     }
//     if (pin.likes.includes(userId)) {
//         return next(new ApiError("You have already liked this pin", 400));
//     }
//     pin.likes.push(userId);
//     await pin.save();
//     sendResponse(res, 200, "success", "Pin liked successfully", { likesCount: pin.likes.length });
// });

// like && unlike  together
const toggleLikePin = asyncErrorHandler(async (req, res, next) => {
  const pinId = req.params.id;
  const userId = req.user.id;

  const pin = await Pin.findById(pinId);
    if (!pin) {
        return next(new ApiError("Pin not found", 404));
    }
    if (pin.likes.includes(userId)) {
        pin.likes.pull(userId);
    } else {
        pin.likes.push(userId);
    }
    await pin.save();
    sendResponse(res, 200, "success", "Pin like status toggled successfully",   { likesCount: pin.likes.length });
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