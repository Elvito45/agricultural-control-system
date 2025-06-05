// Generador de QR para carnet
const QRCode = require('qrcode');

module.exports = async function generateUserQR(user) {
    // Puedes personalizar el contenido del QR aquí
    const qrData = `Productor Ganadero\nID: ${user.id}\nNombre: ${user.names} ${user.surnames}\nEmail: ${user.email}`;
    try {
        return await QRCode.toDataURL(qrData, { width: 180, margin: 1 });
    } catch (err) {
        return null;
    }
};
