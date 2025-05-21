const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

class AuthController {
    async login(req, res) {
        const { username, password } = req.body;
        pool.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) return res.status(500).json({ message: 'DB error', err });
            if (results.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });

            const user = results[0];
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });

            // Genera un token JWT (puedes cambiar la clave secreta)
            const token = jwt.sign({ id: user.id, username: user.username }, 'your-secret-token', { expiresIn: '1h' });
            res.status(200).json({ message: 'Login exitoso', token });
        });
    }

    async register(req, res) {
        const { username, password, nombre, email } = req.body;
        pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'DB error', err });
            if (results.length > 0) return res.status(400).json({ message: 'Usuario o email ya existe' });

            const hashedPassword = await bcrypt.hash(password, 10);
            pool.query(
                'INSERT INTO users (username, password, nombre, email) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, nombre, email],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'DB error', err });
                    res.status(201).json({ message: 'Usuario registrado correctamente' });
                }
            );
        });
    }
}

module.exports = AuthController;