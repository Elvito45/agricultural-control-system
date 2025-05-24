const Livestock = require('../models/livestock');

class LivestockController {
    async registerLivestock(req, res) {
        try {
            const { farm_id, quantity, description } = req.body;
            let seal_path = null;
            let seal_hash = null;
            if (req.file) {
                const { imageHash } = require('image-hash');
                seal_path = req.file.path;
                seal_hash = await new Promise((resolve, reject) => {
                    imageHash(seal_path, 16, true, (error, data) => {
                        if (error) reject(error);
                        else resolve(data);
                    });
                });
            }
            const newLivestock = await Livestock.create({
                farm_id,
                quantity,
                description,
                seal_path,
                seal_hash
            });
            res.status(201).json(newLivestock);
        } catch (error) {
            res.status(500).json({ message: 'Error registering livestock', error });
        }
    }

    async getLivestock(req, res) {
        try {
            const { farmId } = req.params;
            const livestock = await Livestock.findAll({ where: { farm_id: farmId } });
            res.status(200).json(livestock);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving livestock', error });
        }
    }

    async updateLivestock(req, res) {
        try {
            const { id } = req.params;
            const { quantity, description } = req.body;
            let seal_path = null;
            let seal_hash = null;
            if (req.file) {
                const { imageHash } = require('image-hash');
                seal_path = req.file.path;
                seal_hash = await new Promise((resolve, reject) => {
                    imageHash(seal_path, 16, true, (error, data) => {
                        if (error) reject(error);
                        else resolve(data);
                    });
                });
            }
            const updateData = { quantity, description };
            if (seal_path && seal_hash) {
                updateData.seal_path = seal_path;
                updateData.seal_hash = seal_hash;
            }
            const updatedLivestock = await Livestock.update(updateData, { where: { id } });
            if (updatedLivestock[0] === 0) {
                return res.status(404).json({ message: 'Livestock not found' });
            }
            res.status(200).json({ message: 'Livestock updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating livestock', error });
        }
    }
}

module.exports = LivestockController;