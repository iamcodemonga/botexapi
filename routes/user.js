const { Router } = require('express');
const { isLoggedIn } = require('../controllers/auth');
const { allusers, getuser, edituser, bonuses, getallusers } = require('../controllers/user');

const router = Router();

// get all users/investors
router.get('/all', getallusers)

// get a specific user by id
router.get('/', isLoggedIn, getuser)

// edit user information
router.put('/edit', edituser)

router.get('/bonus/:userid', bonuses)

module.exports = router;