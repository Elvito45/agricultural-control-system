exports.checkAuth = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided.' });
    }

    // Here you would typically verify the token (e.g., using JWT)
    // For demonstration, let's assume a simple verification
    if (token !== 'your-secret-token') {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    next();
};