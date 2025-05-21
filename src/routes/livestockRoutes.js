const express = require('express');
const LivestockController = require('../controllers/livestockController');

const router = express.Router();
const livestockController = new LivestockController();

router.post('/register', livestockController.registerLivestock);
router.get('/:farmId', livestockController.getLivestock);
router.put('/:id', livestockController.updateLivestock);

module.exports = router;