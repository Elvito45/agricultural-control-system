exports.checkAuth = (req, res, next) => {
    // Permitir acceso si es admin autenticado
    if (req.session && req.session.isAdmin) {
        return next();
    }

    // Verifica el token en la sesión
    const token = req.session && req.session.token;

    if (!token) {
        // Si no hay token, redirige a login
        return res.redirect('/login');
    }

    next();
};