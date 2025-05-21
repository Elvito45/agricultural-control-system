class LivestockController {
    constructor(livestockModel) {
        this.livestockModel = livestockModel;
    }

    async registerLivestock(req, res) {
        try {
            const { sealImage, farmId, description } = req.body;
            const newLivestock = await this.livestockModel.create({ sealImage, farmId, description });
            res.status(201).json(newLivestock);
        } catch (error) {
            res.status(500).json({ message: 'Error registering livestock', error });
        }
    }

    async getLivestock(req, res) {
        try {
            const { farmId } = req.params;
            const livestock = await this.livestockModel.findAll({ where: { farmId } });
            res.status(200).json(livestock);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving livestock', error });
        }
    }

    async updateLivestock(req, res) {
        try {
            const { id } = req.params;
            const { sealImage, farmId, description } = req.body;
            const updatedLivestock = await this.livestockModel.update(
                { sealImage, farmId, description },
                { where: { id } }
            );
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