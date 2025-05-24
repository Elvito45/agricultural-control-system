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
                description,
                maps_url,
                latitude,
                longitude
            } = req.body;
            const owner_id = req.session.user.id;
            const newFarm = await this.farmModel.create({
                name,
                address,
                owner_id,
                state_id,
                town_id,
                description,
                maps_url,
                latitude,
                longitude
            });
            req.session.flash = { type: 'success', message: 'Finca registrada correctamente.' };
            res.redirect('/dashboard');
        } catch (error) {
            req.session.flash = { type: 'error', message: 'Error al registrar la finca.' };
            res.redirect('/dashboard');
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

    // Maneja la carga de sellos (imágenes)
    async uploadSeal(req, res) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: 'No se recibió ninguna imagen.' });
            }

            const { imageHash } = require('image-hash');
            const farmId = req.params.id;
            const userId = req.user.id || req.session.user.id; // Asegúrate de tener el usuario autenticado
            const Farm = require('../models/farm');

            // 1. Verificar que la finca existe y pertenece al usuario
            const farm = await Farm.findOne({ where: { id: farmId, owner_id: userId } });
            if (!farm) {
                return res.status(403).json({ message: 'No tienes permiso para modificar el sello de esta finca.' });
            }

            // 2. Generar hash perceptual de la imagen
            const hash = await new Promise((resolve, reject) => {
                imageHash(file.path, 16, true, (error, data) => {
                    if (error) reject(error);
                    else resolve(data);
                });
            });

            // 3. Verificar si el hash ya existe en otra finca
            const existe = await Farm.findOne({ where: { seal_hash: hash, id: { $ne: farmId } } });
            if (existe) {
                return res.status(409).json({ message: 'El sello ya está registrado en otra finca.' });
            }

            // 4. Guardar la imagen y el hash en la finca
            farm.seal_path = file.path;
            farm.seal_hash = hash;
            await farm.save();

            res.status(201).json({ message: 'Sello cargado correctamente.' });
        } catch (error) {
            res.status(500).json({ message: 'Error al cargar el sello', error });
        }
    }
}

module.exports = FarmController;