const { Router } = require('express');
const { alldeposits, getuserdeposits, adduserdeposit, approveuserdeposit } = require('../controllers/deposits');

const router = Router();

// Get all deposit records
router.get('/', alldeposits)

// Get specific user deposit records
router.get('/:user', getuserdeposits)

// add a user deposit to record
router.post('/add/:user', adduserdeposit)

// approve a particular deposit
router.put('/approve/:id', approveuserdeposit)

module.exports = router;