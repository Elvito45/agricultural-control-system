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
            // Buscar si el ID ya está en uso
            const idExists = await Owner.findOne({ where: { id } });
            if (idExists) {
                req.session.flash = { type: 'error', message: 'ID ya usado' };
                return res.redirect('/register');
            }
            // Buscar si el correo ya está en uso
            const emailExists = await Owner.findOne({ where: { email } });
            if (emailExists) {
                req.session.flash = { type: 'error', message: 'Correo electrónico ya usado' };
                return res.redirect('/register');
            }
            // Buscar si el teléfono ya está en uso (si se ingresó)
            if (phone) {
                const phoneExists = await Owner.findOne({ where: { phone } });
                if (phoneExists) {
                    req.session.flash = { type: 'error', message: 'Teléfono ya usado' };
                    return res.redirect('/register');
                }
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await Owner.create({
                id,
                names,
                surnames,
                email,
                phone,
                hash: hashedPassword
            });

            if (req.session && req.session.isAdmin) {       
                req.session.flash = { type: 'success', message: 'Registro de propietario exitoso!' };
                return res.redirect('/admin-dashboard');
            }

            req.session.flash = { type: 'success', message: 'Registro de propietario exitoso!' };
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