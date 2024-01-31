const { Router } = require('express');
const { allwithdrawals, getuserwithdrawals, request, approvewithdrawal } = require('../controllers/withdrawals');
const router = Router();

// Get all withdrawal requests
router.get('/', allwithdrawals)

// Get specific user withdrawal requests
router.get('/:user', getuserwithdrawals)

// add a user withdrawal request to record
router.post('/request/:user', request)

// confirm a particular withdrawal request
router.put('/approve/:id', approvewithdrawal)

module.exports = router;