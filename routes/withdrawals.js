const { Router } = require('express');
const { allwithdrawals, totalwithdrawals, getuserwithdrawals, request, approvewithdrawal, getalluserwithdrawals } = require('../controllers/withdrawals');
const router = Router();

// Get all withdrawal requests
router.get('/', totalwithdrawals)

// Get specific user withdrawal requests
router.get('/:user', getalluserwithdrawals)

// add a user withdrawal request to record
router.post('/request/:user', request)

// confirm a particular withdrawal request
router.put('/approve/:id', approvewithdrawal)

module.exports = router;