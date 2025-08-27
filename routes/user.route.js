const express = require('express');
const auth = require('../middlewares/authMiddleware');
const { getProfile,getAllUsers } = require('../controllers/user.controller');

const router = express.Router();


router.get('/profile', auth(), getProfile);
router.get('/',  getAllUsers);

module.exports = router;