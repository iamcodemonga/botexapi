const { Router } = require('express');
const { isLoggedIn } = require('../controllers/auth');
const { allusers, getuser, edituser } = require('../controllers/user');

const router = Router();

// get all users/investors
router.get('/all', allusers)

// get a specific user by id
router.get('/', isLoggedIn, getuser)

// edit user information
router.put('/edit', edituser)

module.exports = router;