const { Router } = require('express');
const { edituserbalance, topup, payday } = require('../controllers/wallet');
const router = Router();

// Edit a user balance
router.put('/edit/:user', edituserbalance)

// Daily top ups
router.put('/topup', topup)

// Payments
router.put('/payday', payday)

module.exports = router;