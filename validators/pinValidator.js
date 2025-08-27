const { body } = require("express-validator");

const pinValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters long")
    .matches(/^[a-zA-Z\s]+$/).withMessage("Title can only contain letters and spaces"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 10, max: 500 }).withMessage("Description must be between 10 and 500 characters long")
    .matches(/^[a-zA-Z0-9\s.,!?'-]+$/).withMessage("Description contains invalid characters"),

  body("imageUrl")
    .notEmpty().withMessage("Image URL is required")
    .matches(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i).withMessage("Invalid image URL format"),

  body("createdBy").optional()
    .notEmpty().withMessage("CreatedBy is required")
    .isMongoId().withMessage("CreatedBy must be a valid Mongo ID"),

  body("board")
    .notEmpty().withMessage("Board is required")
    .isMongoId().withMessage("Board must be a valid Mongo ID"),

  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array")
    .custom((tags) => {
      const valid = tags.every(tag => /^[a-zA-Z0-9\s]+$/.test(tag));
      if (!valid) throw new Error("Tags can only contain letters, numbers, and spaces");
      return true;
    }),

  body("repinFrom")
    .optional({ nullable: true })
    // .isMongoId().withMessage("RepinFrom must be a valid Mongo ID if provided"),
];

module.exports = pinValidator;
