const express = require("express");
const {
  createBoard,
  getBoardById,
  getBoards,
  updateBoard,
  deleteBoard,
} = require("../controllers/board.controller");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").post(auth(), createBoard).get(auth(false), getBoards); // allow public browsing without auth

router
  .route("/:id")
  .get(auth(false), getBoardById) // allow public boards to be viewed without login
  .put(auth(), updateBoard)
  .delete(auth(), deleteBoard);

module.exports = router;
