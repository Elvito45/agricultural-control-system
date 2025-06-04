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
                    { model: Town, as: 'town', attributes: ['name'] },
                    { model: require('./models/livestock'), as: 'livestock' }
                ]
            });
            // Ordenar y filtrar para mostrar solo el registro más reciente de livestock
            farms = farms.map(farm => {
                let quantity = 0;
                if (farm.livestock && farm.livestock.length > 0) {
                    // Buscar el registro más reciente
                    const latest = farm.livestock.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b);
                    quantity = latest.quantity;
                }
                return { ...farm.get({ plain: true }), quantity };
            });
        }
        let flash = null;
        if (req.session.flash) {
            flash = req.session.flash;
            delete req.session.flash;
        }
        res.render('farms', {
            title: 'Mis Fincas',
            user: req.session.user,
            farms,
            flash
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
    const userId = req.session.user.id;
    const Livestock = require('./models/livestock');
    const Farm = require('./models/farm');

    try {
        if (!req.file) {
            req.session.flash = { type: 'error', message: 'Debes subir una imagen de sello.' };
            return res.redirect(`/farms/${farmId}/seal`);
        }

        // Guardar la ruta relativa para mostrar correctamente la imagen
        let seal_path = req.file.path;
        // console.log('Ruta original del archivo:', req.file.path);
        // Convertir a ruta relativa desde 'public' si corresponde
        if (seal_path.includes('public')) {
            seal_path = seal_path.substring(seal_path.indexOf('public') + 7); // 7 = length of 'public/'
        } else if (seal_path.includes('uploads')) {
            // Si no está en public, pero sí en uploads
            seal_path = seal_path.substring(seal_path.indexOf('uploads'));
        }
        // console.log('Ruta relativa del sello:', seal_path);

        // Verificar que la finca existe y pertenece al usuario
        const farm = await Farm.findOne({ where: { id: farmId, owner_id: userId } });
        console.log('Finca encontrada:', farm ? farm.id : null);
        if (!farm) {
            req.session.flash = { type: 'error', message: 'No tienes permiso para modificar el sello de esta finca.' };
            return res.redirect(`/farms/${farmId}/seal`);
        }

        // Generar hash perceptual de la imagen
        const hash = await new Promise((resolve, reject) => {
            imageHash(req.file.path, 16, true, (error, data) => {
                if (error) reject(error);
                else resolve(data);
            });
        });
        // console.log('Hash generado:', hash);

        // Verificar unicidad del hash en livestock
        const { Op } = require('sequelize');
        const exists = await Livestock.findOne({ where: { seal_hash: hash, farm_id: { [Op.ne]: farmId } } });
        // console.log('¿Hash ya existe en otra finca?:', exists ? exists.id : null);
        if (exists) {
            req.session.flash = { type: 'error', message: 'Este sello ya está registrado por otro productor.' };
            return res.redirect(`/farms/${farmId}/seal`);
        }

        // Log antes de actualizar
        // console.log('Actualizando Livestock con:', { seal_path, seal_hash: hash, farm_id: farmId });
        /* const [updatedRows] = */ await Livestock.update(
            { seal_path: seal_path, seal_hash: hash },
            { where: { farm_id: farmId } }
        );
        // console.log('Filas actualizadas:', updatedRows);

        req.session.flash = { type: 'success', message: 'Sello actualizado correctamente.' };
        res.redirect(`/farms/${farmId}/seal`);
    } catch (err) {
        req.session.flash = { type: 'error', message: 'Error al guardar el sello.' };
        // console.log('Error en POST /farms/:id/seal:', err);
        res.redirect(`/farms/${farmId}/seal`);
    }
});

// Nueva ruta: Editar información de la finca
app.get('/farms/:id/edit', checkAuth, async (req, res) => {
    const farmId = req.params.id;
    const Farm = require('./models/farm');
    const Livestock = require('./models/livestock');
    const sequelize = require('./config/db');
    try {
        const farm = await Farm.findByPk(farmId);
        if (!farm) return res.status(404).send('Finca no encontrada');
        const [states] = await sequelize.query('SELECT * FROM states ORDER BY name');
        const [towns] = await sequelize.query('SELECT * FROM towns WHERE state_id = ? ORDER BY name', { replacements: [farm.state_id] });
        // Buscar cantidad de ganado actual
        const livestock = await Livestock.findOne({ where: { farm_id: farmId }, order: [['created_at', 'DESC']] });
        if (livestock) farm.quantity = livestock.quantity;
        let flash = null;
        if (req.session.flash) {
            flash = req.session.flash;
            delete req.session.flash;
        }
        res.render('edit-farm', {
            title: 'Editar Finca',
            user: req.session.user,
            farm,
            states,
            towns,
            flash
        });
    } catch (err) {
        res.status(500).send('Error al cargar la información de la finca');
    }
});

app.post('/farms/:id/edit', checkAuth, async (req, res) => {
    const farmId = req.params.id;
    const Farm = require('./models/farm');
    const Livestock = require('./models/livestock');
    try {
        const { name, address, state_id, town_id, description, maps_url, latitude, longitude, quantity } = req.body;
        console.log('POST /farms/:id/edit', { farmId, name, address, state_id, town_id, description, maps_url, latitude, longitude, quantity });
        // Validar que los campos requeridos existen
        if (!name || !state_id || !town_id) {
            req.session.flash = { type: 'error', message: 'Faltan campos obligatorios.' };
            return res.redirect(`/farms/${farmId}/edit`);
        }
        // Actualizar datos de la finca
        const [updated] = await Farm.update(
            { name, address, state_id, town_id, description, maps_url, latitude, longitude },
            { where: { id: farmId } }
        );
        console.log('Farm.update result:', updated);
        if (!updated && quantity == '0') {
            req.session.flash = { type: 'error', message: 'No se pudo actualizar la finca.' };
            return res.redirect(`/farms/${farmId}/edit`);
        }
        // Actualizar cantidad de ganado en el registro más reciente de livestock para la finca
        if (typeof quantity !== 'undefined' && quantity !== null && quantity !== '') {
            const livestock = await Livestock.findOne({ where: { farm_id: farmId }, order: [['created_at', 'DESC']] });
            console.log('Livestock encontrado para update:', livestock);
            if (livestock) {
                livestock.quantity = quantity;
                await livestock.save();
                console.log('Cantidad de ganado actualizada en livestock:', quantity);
            } else {
                // Si no existe, crear uno nuevo
                await Livestock.create({ farm_id: farmId, quantity, description: 'Registro automático por edición de finca' });
                console.log('Nuevo registro de livestock creado con cantidad:', quantity);
            }
        }
        req.session.flash = { type: 'success', message: 'Finca actualizada correctamente.' };
        res.redirect('/farms');
    } catch (err) {
        console.log('Error en POST /farms/:id/edit:', err);
        req.session.flash = { type: 'error', message: 'Error al actualizar la finca.' };
        res.redirect(`/farms/${farmId}/edit`);
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