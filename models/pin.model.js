const mongoose = require("mongoose");
const pinSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minLength: [3, "Title must be at least 3 characters long"],
      maxLength: [100, "Title must be at most 100 characters long"],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z\s]+$/.test(value);
        },
        message: "Title can only contain letters and spaces",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minLength: [10, "Description must be at least 10 characters long"],
      maxLength: [500, "Description must be at most 500 characters long"],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z0-9\s.,!?'-]+$/.test(value);
        },
        message:
          "Description can only contain letters, numbers, spaces, and basic punctuation",
      },
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      validate: {
        validator: function (value) {
          return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i.test(
            value
          );
        },
        message: "Invalid image URL format",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: [true, "Board is required"],
    },
    tags: {
      type: [String],
      validate: {
        validator: function (value) {
          return value.every((tag) => /^[a-zA-Z0-9\s]+$/.test(tag));
        },
        message: "Tags can only contain letters, numbers, and spaces",
      },
      default: [],
    },
    repinFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pin",
      default: null,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    analytics: {
      views: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

pinSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Pin", pinSchema);

/*
Sample JSON for Creating a Pin Test in postman

{
  "title": "Nature Landscape",
  "description": "A beautiful view of the mountains and lake during sunset.",
  "imageUrl": "https://example.com/images/landscape.jpg",
  "createdBy": "64fbd2481a5fbb6ef6a11233", 
  "board": "64fbd2a91a5fbb6ef6a11456",
  "tags": ["nature", "sunset", "landscape"],
  "repinFrom": null
}

*/