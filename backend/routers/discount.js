const express = require('express');
const router = express.Router();

// Kết nối đến cơ sở dữ liệu
const connection = require('../connection');

// Route lấy danh sách tất cả các discount
router.get('/get', (req, res) => {
    const selectQuery = 'SELECT * FROM discount';

    connection.query(selectQuery, (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json({ discounts: results });
    });
});


// Route lấy theo id discount
router.get('/getById/:id', (req, res) => {
    const discountId = req.params.id;
    const selectQuery = 'SELECT * FROM discount WHERE id = ?';

    connection.query(selectQuery, [discountId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        // Kiểm tra nếu không có discount với ID cung cấp
        if (results.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy mã giảm giá!' });
            return;
        }

        res.json({ discount: results[0] });
    });
});

// thêm discount
router.post('/add', (req, res) => {
    const { name, reduce, description } = req.body;
    const selectQuery = 'SELECT * FROM discount WHERE name = ?';
    const insertQuery = 'INSERT INTO discount (name, reduce, description) VALUES (?, ?, ?)';

    // Kiểm tra xem tên discount đã tồn tại hay chưa
    connection.query(selectQuery, [name], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        // Nếu tên discount đã tồn tại, trả về thông báo
        if (results.length > 0) {
            res.status(400).json({ message: 'Tên mã đã tồn tại!' });
            return;
        }

        // Nếu tên discount chưa tồn tại, thêm vào CSDL
        connection.query(insertQuery, [name, reduce, description], (error, results, fields) => {
            if (error) {
                console.error('Lỗi truy vấn: ' + error);
                res.status(500).send('Lỗi server');
                return;
            }

            res.json({ message: 'Mã Giảm Giá đã được thêm mới!' });
        });
    });
});

// sửa discount
router.put('/update/:id', (req, res) => {
    const discountId = req.params.id;
    const { name, reduce, description } = req.body;
    const selectQuery = 'SELECT * FROM discount WHERE name = ? AND id != ?';
    const updateQuery = 'UPDATE discount SET name = ?, reduce = ?, description = ? WHERE id = ?';

    // Kiểm tra xem tên mới đã tồn tại cho các discount khác chưa
    connection.query(selectQuery, [name, discountId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        // Nếu tên đã tồn tại cho discount khác, trả về mã lỗi 400
        if (results.length > 0) {
            res.status(400).json({ message: 'Tên mã giảm giá đã tồn tại!' });
            return;
        }

        // Nếu tên không tồn tại cho các discount khác, tiến hành cập nhật
        connection.query(updateQuery, [name, reduce, description, discountId], (error, results, fields) => {
            if (error) {
                console.error('Lỗi truy vấn: ' + error);
                res.status(500).send('Lỗi server');
                return;
            }

            res.json({ message: `Mã giảm giá có ID ${discountId} đã được cập nhật!` });
        });
    });
});

//xóa discount
router.delete('/delete/:id', (req, res) => {
    const discountId = req.params.id;
    const deleteQuery = 'DELETE FROM discount WHERE id = ?';

    connection.query(deleteQuery, [discountId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        res.json({ message: `Mã giảm giá có ID ${discountId} đã được xóa!` });
    });
});

module.exports = router;