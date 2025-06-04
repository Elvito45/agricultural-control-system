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

    // Maneja la carga de sellos (imágenes)
    // async uploadSeal(req, res) {
    //     try {
    //         const file = req.file;
    //         if (!file) {
    //             return res.status(400).json({ message: 'No se recibió ninguna imagen.' });
    //         }

    //         const { imageHash } = require('image-hash');
    //         const farmId = req.params.id;
    //         const userId = req.user?.id || req.session.user?.id;
    //         const Farm = require('../models/farm');

    //         // 1. Verificar que la finca existe y pertenece al usuario
    //         const farm = await Farm.findOne({ where: { id: farmId, owner_id: userId } });
    //         if (!farm) {
    //             return res.status(403).json({ message: 'No tienes permiso para modificar el sello de esta finca.' });
    //         }

    //         // 2. Generar hash perceptual de la imagen
    //         const hash = await new Promise((resolve, reject) => {
    //             imageHash(file.path, 16, true, (error, data) => {
    //                 if (error) reject(error);
    //                 else resolve(data);
    //             });
    //         });

    //         // 3. Verificar si el hash ya existe en otra finca (en LIVESTOCK)
    //         const Livestock = require('../models/livestock');
    //         const existe = await Livestock.findOne({ where: { seal_hash: hash, farm_id: { $ne: farmId } } });
    //         if (existe) {
    //             return res.status(409).json({ message: 'El sello ya está registrado en otra finca.' });
    //         }

    //         // 4. Buscar el registro más reciente de livestock para la finca
    //         const livestock = await Livestock.findOne({
    //             where: { farm_id: farmId },
    //             order: [['createdAt', 'DESC']]
    //         });
    //         if (!livestock) {
    //             return res.status(404).json({ message: 'No se encontró registro de ganado para esta finca.' });
    //         }

    //         // 5. Actualizar el registro de livestock con el sello y hash
    //         livestock.seal_path = file.path;
    //         livestock.seal_hash = hash;
    //         await livestock.save();

    //         res.status(201).json({ message: 'Sello cargado correctamente.' });
    //     } catch (error) {
    //         res.status(500).json({ message: 'Error al cargar el sello', error });
    //     }
    // }
}

module.exports = FarmController;