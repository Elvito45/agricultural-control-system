const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const livestockRoutes = require('./routes/livestockRoutes');
const { checkAuth } = require('./middleware/authMiddleware');
const expressSession = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a la base de datos
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Para formularios HTML

// Configuración de express-session
app.use(expressSession({
    secret: 'mi_clave_secreta_segura', // Cambia esto por una clave segura en producción
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Rutas públicas (vistas)
app.get('/', (req, res) => {
    res.render('index', { title: 'Inicio' });
});
app.get('/login', (req, res) => {
    res.render('login', { title: 'Iniciar Sesión' });
});
app.get('/register', (req, res) => {
    res.render('register', { title: 'Registro de Usuario' });
});

// Rutas de autenticación (públicas)
app.use('/api/auth', authRoutes);

// Ruta protegida: dashboard
app.get('/dashboard', checkAuth, async (req, res) => {
    const db = require('./config/db');
    // Obtener todos los estados
    db.pool.query('SELECT id, name FROM states ORDER BY name', (err, states) => {
        if (err) return res.status(500).send('Error al cargar los estados');
        res.render('dashboard', {
            title: 'Panel de Control',
            user: req.session.user,
            states,
            towns: [] // Inicialmente vacío, se llenará por AJAX
        });
    });
});

// Middleware de autenticación SOLO para rutas protegidas de API
app.use(checkAuth);

// Rutas protegidas (APIs)
app.use('/api/farms', farmRoutes);
app.use('/api/livestock', livestockRoutes);

// Endpoint para obtener municipios por estado (AJAX)
app.get('/api/towns', (req, res) => {
    const db = require('./config/db');
    const stateId = req.query.state_id;
    if (!stateId) return res.json([]);
    db.pool.query('SELECT id, name FROM towns WHERE state_id = ? ORDER BY name', [stateId], (err, towns) => {
        if (err) return res.status(500).json([]);
        res.json(towns);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});