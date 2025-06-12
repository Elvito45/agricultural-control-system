const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('uploadSeal.js cargado');

// Asegura que la carpeta de destino exista
const dest = path.join(__dirname, '../uploads/seals');
if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
}

// Configuración de almacenamiento para los sellos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        // Usar un nombre corto: seal{farm_id}.ext
        let ext = path.extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
            ext = '.jpg'; // fallback
        }
        // farm_id puede venir en req.body o req.params
        const farmId = req.body.farm_id || req.params.id || 'unknown';
        const filename = `seal${farmId}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    // Solo permitir imágenes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
