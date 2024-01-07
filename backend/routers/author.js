const express = require('express');
const router = express.Router();

// Kết nối đến cơ sở dữ liệu
const connection = require('../connection'); // Đảm bảo rằng bạn đã cấu hình kết nối CSDL trong file db.js

// Route lấy danh sách tất cả các author
router.get('/get', (req, res) => {
    connection.query('SELECT * FROM author', (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json(results);
    });
});

router.get('/getById/:id', (req, res) => {
    const authorId = req.params.id;
    const query = 'SELECT name, description FROM author WHERE id = ?';

    connection.query(query, [authorId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Không tìm thấy Tác Giả');
            return;
        }

        res.json(results[0]); // Trả về author đầu tiên từ kết quả truy vấn
    });
});

// Route thêm author mới
router.post('/add', (req, res) => {
    const { name, description } = req.body;
    const selectQuery = 'SELECT * FROM author WHERE name = ?';
    const insertQuery = 'INSERT INTO author (name, description) VALUES (?, ?)';

    // Kiểm tra xem author đã tồn tại hay không
    connection.query(selectQuery, [name], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        // Nếu author đã tồn tại, trả về thông báo
        if (results.length > 0) {
            res.status(400).json({ message: 'Tác Giả đã tồn tại!' });
            return;
        }

        // Nếu author chưa tồn tại, thêm vào CSDL
        connection.query(insertQuery, [name, description], (error, results, fields) => {
            if (error) {
                console.error('Lỗi truy vấn: ' + error);
                res.status(500).send('Lỗi server');
                return;
            }

            res.json({ message: 'Tác Giả đã được thêm mới!' });
        });
    });
});


// Route sửa author theo ID
router.put('/update/:id', (req, res) => {
    const authorId = req.params.id;
    const { name, description } = req.body;
    const selectQuery = 'SELECT * FROM author WHERE name = ? AND id != ?';
    const updateQuery = 'UPDATE author SET name = ?, description = ? WHERE id = ?';

    // Kiểm tra xem tên mới đã tồn tại cho các tác giả khác chưa
    connection.query(selectQuery, [name, authorId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        // Nếu tên đã tồn tại cho tác giả khác, trả về mã lỗi 400
        if (results.length > 0) {
            res.status(400).json({ message: 'Tên tác giả đã tồn tại!' });
            return;
        }

        // Nếu tên chưa tồn tại cho các tác giả khác, tiến hành cập nhật
        connection.query(updateQuery, [name, description, authorId], (error, results, fields) => {
            if (error) {
                console.error('Lỗi truy vấn: ' + error);
                res.status(500).send('Lỗi server');
                return;
            }

            res.json({ message: `Tác Giả có ID ${authorId} đã được cập nhật!` });
        });
    });
});


// Route xóa author theo ID
router.delete('/delete/:id', (req, res) => {
    const authorId = req.params.id;
    const query = 'DELETE FROM author WHERE id = ?';

    connection.query(query, [authorId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json({ message: `Tác Giả có ID ${authorId} đã được xóa!` });
    });
});

module.exports = router;