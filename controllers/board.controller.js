const asyncErrorHandler = require("../utils/asyncErrorHandler");
const ApiError = require("../utils/apiError");
const sendResponse = require("../utils/sendResponse");
const Board = require("../models/board.model");
const Pin = require("../models/pin.model");

// Create a new board
const createBoard = asyncErrorHandler(async (req, res, next) => {
  const { name, description, isPrivate } = req.body;
  const userId = req.user.id;

  const board = new Board({
    name,
    description,
    isPrivate: isPrivate ?? false,
    createdBy: userId,
  });

  await board.save();

  sendResponse(res, 201, "success", "Board created successfully", { board });
});

// Get a single board (respect privacy)
const getBoardById = asyncErrorHandler(async (req, res, next) => {
  const boardId = req.params.id;
  const userId = req.user ? req.user.id : null;

  const board = await Board.findById(boardId)
    .populate("createdBy", "username avatar")
    .populate("pins");

  if (!board) {
    return next(new ApiError("Board not found", 404));
  }

  if (board.isPrivate && board.createdBy._id.toString() !== userId) {
    return next(new ApiError("You are not authorized to view this board", 403));
  }

  sendResponse(res, 200, "success", "Board retrieved successfully", { board });
});

// Get all boards (only public + user's private)
const getBoards = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user ? req.user.id : null;
  const { page = 1, limit = 10 } = req.query;

  const query = userId
    ? { $or: [{ isPrivate: false }, { createdBy: userId }] }
    : { isPrivate: false };

  const boards = await Board.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate("createdBy", "username avatar")
    .sort({ createdAt: -1 });

  const totalBoards = await Board.countDocuments(query);
  const totalPages = Math.ceil(totalBoards / limit);

  sendResponse(res, 200, "success", "Boards retrieved successfully", {
    boards,
    pagination: {
      totalBoards,
      totalPages,
      currentPage: parseInt(page),
    },
  });
});

// Update a board
const updateBoard = asyncErrorHandler(async (req, res, next) => {
  const boardId = req.params.id;
  const userId = req.user.id;
  const { name, description, isPrivate } = req.body;

  const board = await Board.findById(boardId);
  if (!board) {
    return next(new ApiError("Board not found", 404));
  }
  if (board.createdBy.toString() !== userId) {
    return next(new ApiError("You do not own this board", 403));
  }

  if (name) board.name = name;
  if (description) board.description = description;
  if (typeof isPrivate === "boolean") board.isPrivate = isPrivate;

  await board.save();

  sendResponse(res, 200, "success", "Board updated successfully", { board });
});

// Delete a board (and optionally its pins)
const deleteBoard = asyncErrorHandler(async (req, res, next) => {
  const boardId = req.params.id;
  const userId = req.user.id;

  const board = await Board.findById(boardId);
  if (!board) {
    return next(new ApiError("Board not found", 404));
  }

  if (board.createdBy.toString() !== userId) {
    return next(new ApiError("You do not own this board", 403));
  }

  // Remove associated pins if needed
  await Pin.deleteMany({ board: boardId });

  // Use deleteOne() instead of remove()
  await board.deleteOne();

  sendResponse(res, 200, "success", "Board deleted successfully");
});

module.exports = {
  createBoard,
  getBoardById,
  getBoards,
  updateBoard,
  deleteBoard,
};
