const express = require('express');
const router = express.Router();

// Kết nối đến cơ sở dữ liệu
const connection = require('../connection'); // Đảm bảo rằng bạn đã cấu hình kết nối CSDL trong file db.js

// Route lấy danh sách tất cả các category
router.get('/get', (req, res) => {
    connection.query('SELECT * FROM category', (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json(results);
    });
});

router.get('/getById/:id', (req, res) => {
    const categoryId = req.params.id;
    const query = 'SELECT name, description FROM category WHERE id = ?';

    connection.query(query, [categoryId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Không tìm thấy danh mục');
            return;
        }

        res.json(results[0]); // Trả về category đầu tiên từ kết quả truy vấn
    });
});

// Route thêm category mới
router.post('/add', (req, res) => {
    const { name, description } = req.body;
    const selectQuery = 'SELECT * FROM category WHERE name = ?';
    const insertQuery = 'INSERT INTO category (name, description) VALUES (?, ?)';

    // Kiểm tra xem category đã tồn tại hay không
    connection.query(selectQuery, [name], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        // Nếu category đã tồn tại, trả về thông báo
        if (results.length > 0) {
            res.status(400).json({ message: 'Danh Mục đã tồn tại!' });
            return;
        }

        // Nếu category chưa tồn tại, thêm vào CSDL
        connection.query(insertQuery, [name, description], (error, results, fields) => {
            if (error) {
                console.error('Lỗi truy vấn: ' + error);
                res.status(500).send('Lỗi server');
                return;
            }

            res.json({ message: 'Danh Mục đã được thêm mới!' });
        });
    });
});


// Route sửa category theo ID
router.put('/update/:id', (req, res) => {
    const categoryId = req.params.id;
    const { name, description } = req.body;
    const query = 'UPDATE category SET name = ?, description = ? WHERE id = ?';

    connection.query(query, [name, description, categoryId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json({ message: `Danh Mục có ID ${categoryId} đã được cập nhật!` });
    });
});

// Route xóa category theo ID
router.delete('/delete/:id', (req, res) => {
    const categoryId = req.params.id;
    const query = 'DELETE FROM category WHERE id = ?';

    connection.query(query, [categoryId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json({ message: `Danh Mục có ID ${categoryId} đã được xóa!` });
    });
});

module.exports = router;