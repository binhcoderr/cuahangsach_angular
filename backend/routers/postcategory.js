const express = require('express');
const router = express.Router();

// Kết nối đến cơ sở dữ liệu
const connection = require('../connection'); // Đảm bảo rằng bạn đã cấu hình kết nối CSDL trong file db.js

// Route lấy danh sách tất cả các postcategory
router.get('/get', (req, res) => {
    connection.query('SELECT * FROM postcategory', (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json(results);
    });
});

router.get('/getById/:id', (req, res) => {
    const postcategoryId = req.params.id;
    const query = 'SELECT name, description FROM postcategory WHERE id = ?';

    connection.query(query, [postcategoryId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Không tìm thấy loại bài viết');
            return;
        }

        res.json(results[0]); // Trả về postcategory đầu tiên từ kết quả truy vấn
    });
});

// Route thêm postcategory mới
router.post('/add', (req, res) => {
    const { name, description } = req.body;
    const selectQuery = 'SELECT * FROM postcategory WHERE name = ?';
    const insertQuery = 'INSERT INTO postcategory (name, description) VALUES (?, ?)';

    // Kiểm tra xem postcategory đã tồn tại hay không
    connection.query(selectQuery, [name], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        // Nếu postcategory đã tồn tại, trả về thông báo
        if (results.length > 0) {
            res.status(400).json({ message: 'Loại Bài Viết đã tồn tại!' });
            return;
        }

        // Nếu postcategory chưa tồn tại, thêm vào CSDL
        connection.query(insertQuery, [name, description], (error, results, fields) => {
            if (error) {
                console.error('Lỗi truy vấn: ' + error);
                res.status(500).send('Lỗi server');
                return;
            }

            res.json({ message: 'Loại Bài Viết đã được thêm mới!' });
        });
    });
});


// Route sửa postcategory theo ID
router.put('/update/:id', (req, res) => {
    const postcategoryId = req.params.id;
    const { name, description } = req.body;
    const selectQuery = 'SELECT * FROM postcategory WHERE name = ? AND id != ?';
    const updateQuery = 'UPDATE postcategory SET name = ?,  description = ? WHERE id = ?';

    // Kiểm tra xem tên mới đã tồn tại cho các postcategory khác chưa
    connection.query(selectQuery, [name, postcategoryId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        // Nếu tên đã tồn tại cho postcategory khác, trả về mã lỗi 400
        if (results.length > 0) {
            res.status(400).json({ message: 'Tên loại bài viết đã tồn tại!' });
            return;
        }

        // Nếu tên không tồn tại cho các postcategory khác, tiến hành cập nhật
        connection.query(updateQuery, [name, description, postcategoryId], (error, results, fields) => {
            if (error) {
                console.error('Lỗi truy vấn: ' + error);
                res.status(500).send('Lỗi server');
                return;
            }

            res.json({ message: `Loại Bài Viết có ID ${postcategoryId} đã được cập nhật!` });
        });
    });
});

// Route xóa postcategory theo ID
router.delete('/delete/:id', (req, res) => {
    const postcategoryId = req.params.id;
    const query = 'DELETE FROM postcategory WHERE id = ?';

    connection.query(query, [postcategoryId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json({ message: `Loại Bài Viết có ID ${postcategoryId} đã được xóa!` });
    });
});

module.exports = router;