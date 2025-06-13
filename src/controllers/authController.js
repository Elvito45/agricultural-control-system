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
}

module.exports = AuthController;