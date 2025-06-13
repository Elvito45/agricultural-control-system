class FarmController {
    constructor() {
        this.farmModel = require('../models/farm');
    }
    
    async createFarm(req, res) {
        try {
            const {
                name,
                address,
                state_id,
                town_id,
                parroquia_id,
                description,
                maps_url,
                latitude,
                longitude,
                quantity // cantidad de ganado
            } = req.body;
            const owner_id = req.session.user.id;
            const newFarm = await this.farmModel.create({
                name,
                address,
                owner_id,
                state_id,
                town_id,
                parroquia_id,
                description,
                maps_url,
                latitude,
                longitude
            });
            // Crear registro de livestock asociado a la finca
            if (quantity) {
                const Livestock = require('../models/livestock');
                await Livestock.create({
                    farm_id: newFarm.id,
                    quantity,
                    description: 'Registro inicial de ganado',
                    seal_path: null,
                    seal_hash: null
                });
            }
            req.session.flash = { type: 'success', message: 'Finca registrada correctamente.' };
            res.redirect('/farms');
        } catch (error) {
            req.session.flash = { type: 'error', message: 'Error al registrar la finca.' };
            console.error('Error creating farm:', error);
            res.redirect('/farms');
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
}

module.exports = FarmController;