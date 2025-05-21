const express = require('express');
const FarmController = require('../controllers/farmController');
const router = express.Router();
const farmController = new FarmController(/* pasa el modelo si es necesario */);

router.post('/', farmController.createFarm.bind(farmController));
router.get('/:id', farmController.getFarm.bind(farmController));
router.put('/:id', farmController.updateFarm.bind(farmController));

module.exports = router;