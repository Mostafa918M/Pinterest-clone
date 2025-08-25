const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Board name is required"],
      trim: true,
      minlength: [3, "Board name must be at least 3 characters long"],
      maxlength: [100, "Board name must be at most 100 characters long"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters long"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false, // false = public, true = private
    },
    pins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pin",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Board", boardSchema);
