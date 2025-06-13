const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Owner = require('../models/user');

class AuthController {
    async login(req, res) {
        const { id, password } = req.body;
        try {
            const user = await Owner.findOne({ where: { id } });
            if (!user) {
                req.session.flash = { type: 'error', message: 'Usuario no encontrado' };
                return res.redirect('/login');
            }

            const valid = await bcrypt.compare(password, user.hash);
            if (!valid) {
                req.session.flash = { type: 'error', message: 'Contraseña incorrecta' };
                return res.redirect('/login');
            }

            const token = jwt.sign({ id: user.id, email: user.email }, 'your-secret-token', { expiresIn: '1h' });
            req.session.token = token;
            req.session.user = {
                id: user.id,
                names: user.names,
                surnames: user.surnames,
                email: user.email,
                phone: user.phone
            };
            res.redirect('/dashboard');
        } catch (err) {
            req.session.flash = { type: 'error', message: 'Error de base de datos' };
            console.error('Login error:', err);
            res.redirect('/login');
        }
    }

    async register(req, res) {
        const { id, names, surnames, email, phone, password } = req.body;
        try {
            const exists = await Owner.findOne({ where: { [Op.or]: [{ id }, { email }] } });
            if (exists) return res.status(400).json({ message: 'Propietario ya registrado' });

            const hashedPassword = await bcrypt.hash(password, 10);
            await Owner.create({
                id,
                names,
                surnames,
                email,
                phone,
                hash: hashedPassword
            });
            req.session.flash = { type: 'success', message: 'Registro exitoso. Ahora puedes iniciar sesión.' };
            res.redirect('/login');
        } catch (err) {
            req.session.flash = { type: 'error', message: 'Error de base de datos' };
            console.error('Registration error:', err);
            res.redirect('/register');
        }
    }

    async logout(req, res) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Error al cerrar sesión');
            }
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    }

    async changePassword(req, res) {
        const { currentPassword, newPassword } = req.body;
        try {
            const userId = req.session.user && req.session.user.id;
            if (!userId) {
                req.session.flash = { type: 'error', message: 'No autenticado.' };
                return res.redirect('/login');
            }
            const user = await Owner.findOne({ where: { id: userId } });
            if (!user) {
                req.session.flash = { type: 'error', message: 'Usuario no encontrado.' };
                return res.redirect('/login');
            }
            const valid = await bcrypt.compare(currentPassword, user.hash);
            if (!valid) {
                req.session.flash = { type: 'error', message: 'La contraseña actual es incorrecta.' };
                return res.redirect('/dashboard');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await user.update({ hash: hashedPassword });
            req.session.flash = { type: 'success', message: 'Contraseña actualizada correctamente.' };
            res.redirect('/dashboard');
        } catch (err) {
            req.session.flash = { type: 'error', message: 'Error al cambiar la contraseña.' };
            res.redirect('/dashboard');
        }
    }
}

module.exports = AuthController;