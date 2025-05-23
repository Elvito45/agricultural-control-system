const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',           // <-- tu usuario de MySQL
    password: '',           // <-- tu contraseña de MySQL (vacía si no tiene)
    database: 'cattle',// <-- tu base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

function connectDB() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
        } else {
            console.log('Conexión a la base de datos MySQL exitosa');
            connection.release();
        }
    });
}

module.exports = connectDB;
module.exports.pool = pool;