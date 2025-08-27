const express = require("express");

const {
  createPin,
  getPinById,
  repin,
  getPins,
  updatePin,
  deletePin,
  toggleLikePin,
} = require("../controllers/pin.controller");

const auth = require("../middlewares/authMiddleware");

const pinValidator = require("../validators/pinValidator");

const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

router
  .route("/")
  .post(auth(["user", "admin"]), pinValidator, validateRequest, createPin)
  .get(getPins);

router
  .route("/:id")
  .get(getPinById)
  .put(auth(), pinValidator, validateRequest, updatePin)
  .delete(auth(), deletePin);

router.post("/:id/repin", auth(), repin);

router.post("/:id/toggle-like", auth(), toggleLikePin);

module.exports = router;
