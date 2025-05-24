const express = require('express');
const LivestockController = require('../controllers/livestockController');
const uploadSeal = require('../middleware/uploadSeal');

const router = express.Router();
const livestockController = new LivestockController();

router.post('/register', uploadSeal.single('seal'), livestockController.registerLivestock);
router.get('/:farmId', livestockController.getLivestock);
router.put('/:id', uploadSeal.single('seal'), livestockController.updateLivestock);

module.exports = router;