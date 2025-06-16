const { Sequelize } = require('sequelize');

// Configura la instancia de Sequelize para MySQL
const sequelize = new Sequelize('cattle', 'root', 'moisi', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false // Puedes poner true para ver las queries en consola
});

// Comprobación de conexión
sequelize.authenticate()
    .then(() => console.log('Conexión a la base de datos MySQL exitosa'))
    .catch(err => console.error('Error al conectar a la base de datos:', err));

module.exports = sequelize;