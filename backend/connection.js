const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'binhnguyen126',
    database: 'cuahangsach'
});
connection.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối: ' + err.stack);
        return;
    }

    console.log('Đã kết nối thành công');
});

module.exports = connection;