exports.checkAuth = (req, res, next) => {
    // Verifica el token en la sesión
    const token = req.session && req.session.token;

    if (!token) {
        // Si no hay token, redirige a login
        return res.redirect('/login');
    }

    // Aquí podrías verificar el token JWT si lo deseas
    // Si quieres validar el JWT:
    // const jwt = require('jsonwebtoken');
    // try {
    //     jwt.verify(token, 'your-secret-token');
    // } catch (err) {
    //     return res.redirect('/login');
    // }

    next();
};