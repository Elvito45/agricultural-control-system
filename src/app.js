const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const { checkAuth } = require('./middleware/authMiddleware');
const expressSession = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const uploadSeal = require('./middleware/uploadSeal');
const { imageHash } = require('image-hash');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // layout.ejs por defecto
app.use(express.static(path.join(__dirname, 'public')));

// Servir archivos estáticos de uploads (para imágenes de sellos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    // Mostrar mensaje flash si existe
    let flash = null;
    if (req.session.flash) {
        flash = req.session.flash;
        delete req.session.flash;
    }
    res.render('dashboard', {
        title: 'Panel de Control',
        user: req.session.user,
        flash
    });
});

// Nueva ruta para ver listado de fincas
app.get('/farms', checkAuth, async (req, res) => {
    const Farm = require('./models/farm');
    const State = require('./models/state');
    const Town = require('./models/town');
    let farms = [];
    try {
        if (req.session.user) {
            farms = await Farm.findAll({
                where: { owner_id: req.session.user.id },
                include: [
                    { model: State, as: 'state', attributes: ['name'] },
                    { model: Town, as: 'town', attributes: ['name'] }
                ]
            });
        }
        res.render('farms', {
            title: 'Mis Fincas',
            user: req.session.user,
            farms
        });
    } catch (err) {
        res.status(500).send('Error al cargar las fincas');
    }
});

// Nueva ruta para registrar finca
app.get('/register-farm', checkAuth, async (req, res) => {
    const sequelize = require('./config/db');
    try {
        const [states] = await sequelize.query('SELECT * FROM states ORDER BY name');
        let flash = null;
        if (req.session.flash) {
            flash = req.session.flash;
            delete req.session.flash;
        }
        res.render('register-farm', {
            title: 'Registrar Finca',
            user: req.session.user,
            states,
            flash
        });
    } catch (err) {
        return res.status(500).send('Error al cargar los estados');
    }
});

// Gestión de sello de finca
app.get('/farms/:id/seal', checkAuth, async (req, res) => {
    const farmId = req.params.id;
    try {
        // Buscar el registro de livestock más reciente con sello para la finca
        const Livestock = require('./models/livestock');
        const Farm = require('./models/farm');
        const farm = await Farm.findByPk(farmId);
        const livestock = await Livestock.findOne({
            where: { farm_id: farmId, seal_path: { [require('sequelize').Op.ne]: null } },
            order: [['created_at', 'DESC']]
        });
        let flash = null;
        if (req.session.flash) {
            flash = req.session.flash;
            delete req.session.flash;
        }
        res.render('farm-seal', { title: 'Gestionar sello', user: req.session.user, farmId, farmName: farm ? farm.name : '', livestock, flash });
    } catch (err) {
        res.status(500).send('Error al cargar el sello de la finca');
    }
});

app.post('/farms/:id/seal', checkAuth, uploadSeal.single('seal'), async (req, res) => {
    const farmId = req.params.id;
    const Livestock = require('./models/livestock');
    try {
        if (!req.file) {
            req.session.flash = { type: 'error', message: 'Debes subir una imagen de sello.' };
            return res.redirect(`/farms/${farmId}/seal`);
        }
        // Calcular hash de la imagen
        // Guardar la ruta relativa para mostrar correctamente la imagen
        let seal_path = req.file.path;
        // Convertir a ruta relativa desde 'public' si corresponde
        if (seal_path.includes('public')) {
            seal_path = seal_path.substring(seal_path.indexOf('public') + 7); // 7 = length of 'public/'
        } else if (seal_path.includes('uploads')) {
            // Si no está en public, pero sí en uploads
            seal_path = seal_path.substring(seal_path.indexOf('uploads'));
        }
        const seal_hash = await new Promise((resolve, reject) => {
            imageHash(req.file.path, 16, true, (error, data) => {
                if (error) reject(error);
                else resolve(data);
            });
        });
        // Verificar unicidad del hash en livestock
        const exists = await Livestock.findOne({ where: { seal_hash } });
        if (exists) {
            req.session.flash = { type: 'error', message: 'Este sello ya está registrado por otro productor.' };
            return res.redirect(`/farms/${farmId}/seal`);
        }
        // Crear un nuevo registro de livestock con el sello
        await Livestock.create({
            farm_id: farmId,
            quantity: 0, // o el valor que corresponda
            description: 'Sello de finca',
            seal_path,
            seal_hash
        });
        req.session.flash = { type: 'success', message: 'Sello actualizado correctamente.' };
        res.redirect(`/farms/${farmId}/seal`);
    } catch (err) {
        req.session.flash = { type: 'error', message: 'Error al guardar el sello.' };
        res.redirect(`/farms/${farmId}/seal`);
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