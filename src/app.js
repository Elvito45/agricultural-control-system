const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const livestockRoutes = require('./routes/livestockRoutes');
const { checkAuth } = require('./middleware/authMiddleware');

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

// Middleware de autenticación SOLO para rutas protegidas
app.use(checkAuth);

// Rutas protegidas (APIs)
app.use('/api/farms', farmRoutes);
app.use('/api/livestock', livestockRoutes);

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Panel de Control' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});