const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

class AuthController {
    async login(req, res) {
        const { username, password } = req.body;
        pool.query('SELECT * FROM user WHERE username = ?', [username], async (err, results) => {
            if (err) return res.status(500).json({ message: 'DB error', err });
            if (results.length === 0) return res.status(401).render('login', { message: 'Usuario no encontrado' });

            const user = results[0];
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(401).render('login', { message: 'Contraseña incorrecta' });

            // Genera un token JWT (puedes cambiar la clave secreta)
            const token = jwt.sign({ id: user.id, username: user.username }, 'your-secret-token', { expiresIn: '1h' });

            // Guarda el token y usuario en la sesión
            req.session.token = token;
            req.session.user = { id: user.id, username: user.username };

            // Redirige al dashboard
            res.redirect('/dashboard');
        });
    }

    async register(req, res) {
        const { username, password, nombre, email } = req.body;
        pool.query('SELECT * FROM user WHERE username = ? OR email = ?', [username, email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'DB error', err });
            if (results.length > 0) return res.status(400).json({ message: 'Usuario o email ya existe' });

            const hashedPassword = await bcrypt.hash(password, 10);
            pool.query(
                'INSERT INTO user (username, password, email) VALUES (?, ?, ?)',
                [username, hashedPassword, email],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'DB error', err });
                    res.status(201).json({ message: 'Usuario registrado correctamente' });
                }
            );
        });
    }
}

module.exports = AuthController;