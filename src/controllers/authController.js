const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Owner = require('../models/user');

class AuthController {
    async login(req, res) {
        const { id, password } = req.body;
        try {
            const user = await Owner.findOne({ where: { id } });
            if (!user) return res.status(401).render('login', { message: 'Usuario no encontrado' });

            const valid = await bcrypt.compare(password, user.hash);
            if (!valid) return res.status(401).render('login', { message: 'Contraseña incorrecta' });

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
            res.status(500).json({ message: 'DB error', err });
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
            res.redirect('/login');
        } catch (err) {
            res.status(500).json({ message: 'DB error', err });
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