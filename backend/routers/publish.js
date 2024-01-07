const express = require('express');
const router = express.Router();

// Kết nối đến cơ sở dữ liệu
const connection = require('../connection'); // Đảm bảo rằng bạn đã cấu hình kết nối CSDL trong file db.js

// Route lấy danh sách tất cả các publish
router.get('/get', (req, res) => {
    connection.query('SELECT * FROM publish', (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json(results);
    });
});

router.get('/getById/:id', (req, res) => {
    const publishId = req.params.id;
    const query = 'SELECT name, description FROM publish WHERE id = ?';

    connection.query(query, [publishId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Không tìm thấy Nhà Xuất Bản');
            return;
        }

        res.json(results[0]); // Trả về publish đầu tiên từ kết quả truy vấn
    });
});

// Route thêm publish mới
router.post('/add', (req, res) => {
    const { name, description } = req.body;
    const selectQuery = 'SELECT * FROM publish WHERE name = ?';
    const insertQuery = 'INSERT INTO publish (name, description) VALUES (?, ?)';

    // Kiểm tra xem publish đã tồn tại hay không
    connection.query(selectQuery, [name], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        // Nếu publish đã tồn tại, trả về thông báo
        if (results.length > 0) {
            res.status(400).json({ message: 'Nhà Xuất Bản đã tồn tại!' });
            return;
        }

        // Nếu publish chưa tồn tại, thêm vào CSDL
        connection.query(insertQuery, [name, description], (error, results, fields) => {
            if (error) {
                console.error('Lỗi truy vấn: ' + error);
                res.status(500).send('Lỗi server');
                return;
            }

            res.json({ message: 'Nhà Xuất Bản đã được thêm mới!' });
        });
    });
});


// Route sửa publish theo ID
router.put('/update/:id', (req, res) => {
    const publishId = req.params.id;
    const { name, description } = req.body;
    const query = 'UPDATE publish SET name = ?, description = ? WHERE id = ?';

    connection.query(query, [name, description, publishId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json({ message: `Nhà Xuất Bản có ID ${publishId} đã được cập nhật!` });
    });
});

// Route xóa publish theo ID
router.delete('/delete/:id', (req, res) => {
    const publishId = req.params.id;
    const query = 'DELETE FROM publish WHERE id = ?';

    connection.query(query, [publishId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json({ message: `Nhà Xuất Bản có ID ${publishId} đã được xóa!` });
    });
});

module.exports = router;