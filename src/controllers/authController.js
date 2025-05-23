const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

class AuthController {
    async login(req, res) {
        const { id, password } = req.body;
        pool.query('SELECT * FROM owners WHERE id = ?', [id], async (err, results) => {
            if (err) return res.status(500).json({ message: 'DB error', err });
            if (results.length === 0) return res.status(401).render('login', { message: 'Usuario no encontrado' });

            const user = results[0];
            const valid = await bcrypt.compare(password, user.hash);
            if (!valid) return res.status(401).render('login', { message: 'Contraseña incorrecta' });

            // Genera un token JWT (puedes cambiar la clave secreta)
            const token = jwt.sign({ id: user.id, username: user.username }, 'your-secret-token', { expiresIn: '1h' });

            // Guarda el token y usuario en la sesión
            req.session.token = token;
            req.session.user = {
                id: user.id,
                names: user.names,
                surnames: user.surnames,
                email: user.email,
                phone: user.phone
            };
            // Redirige al dashboard
            res.redirect('/dashboard');
        });
    }

    async register(req, res) {
        const { id, names, surnames, email, password } = req.body;
        pool.query('SELECT * FROM owners WHERE id = ? OR email = ?', [id, email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'DB error', err });
            if (results.length > 0) return res.status(400).json({ message: 'Propietario ya registrado' });

            const hashedPassword = await bcrypt.hash(password, 10);
            pool.query(
                'INSERT INTO owners (id, names, surnames, email, hash) VALUES (?, ?, ?, ?, ?)',
                [id, names, surnames, email, hashedPassword],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'DB error', err });
                    res.redirect('/login');
                }
            );
        });
    }
}

module.exports = AuthController;