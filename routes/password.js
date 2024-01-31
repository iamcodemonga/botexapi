const { Router } = require('express');
const { changepassword, resetpassword } = require('../controllers/password');
const router = Router();

router.put('/', changepassword)

router.put('/reset', resetpassword)

module.exports = router;