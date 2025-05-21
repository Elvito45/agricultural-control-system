class FarmController {
    constructor(farmModel) {
        this.farmModel = farmModel;
    }

    async createFarm(req, res) {
        try {
            const { name, address, state, userId } = req.body;
            const newFarm = await this.farmModel.create({ name, address, state, userId });
            res.status(201).json(newFarm);
        } catch (error) {
            res.status(500).json({ message: 'Error creating farm', error });
        }
    }

    async getFarm(req, res) {
        try {
            const { id } = req.params;
            const farm = await this.farmModel.findByPk(id);
            if (!farm) {
                return res.status(404).json({ message: 'Farm not found' });
            }
            res.status(200).json(farm);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving farm', error });
        }
    }

    async updateFarm(req, res) {
        try {
            const { id } = req.params;
            const { name, address, state } = req.body;
            const [updated] = await this.farmModel.update({ name, address, state }, { where: { id } });
            if (!updated) {
                return res.status(404).json({ message: 'Farm not found' });
            }
            const updatedFarm = await this.farmModel.findByPk(id);
            res.status(200).json(updatedFarm);
        } catch (error) {
            res.status(500).json({ message: 'Error updating farm', error });
        }
    }
}

module.exports = FarmController;