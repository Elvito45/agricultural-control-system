const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const { checkAuth } = require('./middleware/authMiddleware');
const expressSession = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

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
    const Farm = require('./models/farm');
    const sequelize = require('./config/db');
    // Obtener todos los estados usando Sequelize
    try {
        const [states] = await sequelize.query('SELECT * FROM states ORDER BY name');
        let farms = [];
        if (req.session.user) {
            try {
                // Buscar fincas del usuario autenticado
                farms = await Farm.findAll({ where: { owner_id: req.session.user.id } });
            } catch (farmErr) {
                console.error('Error al buscar las fincas del usuario:', farmErr);
                return res.status(500).send('Error al buscar las fincas del usuario: ' + farmErr.message);
            }
        }
        // Mostrar mensaje flash si existe
        let flash = null;
        if (req.session.flash) {
            flash = req.session.flash;
            delete req.session.flash;
        }
        res.render('dashboard', {
            title: 'Panel de Control',
            user: req.session.user,
            states,
            towns: [], // Inicialmente vacío, se llenará por AJAX
            farms,
            flash
        });
    } catch (err) {
        return res.status(500).send('Error al cargar los estados');
    }
});

// Middleware de autenticación SOLO para rutas protegidas de API
app.use(checkAuth);

// Rutas protegidas (APIs)
app.use('/api/farms', farmRoutes);

// Endpoint para obtener municipios por estado (AJAX)
app.get('/api/towns', async (req, res) => {
    const sequelize = require('./config/db');
    const stateId = req.query.state_id;
    if (!stateId) return res.json([]);
    try {
        const [towns] = await sequelize.query('SELECT id, name FROM towns WHERE state_id = ? ORDER BY name', {
            replacements: [stateId]
        });
        res.json(towns);
    } catch (err) {
        res.status(500).json([]);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});