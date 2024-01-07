const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
// Kết nối đến cơ sở dữ liệu
const connection = require('../connection');

// API endpoint: Lấy danh sách tất cả users
router.get('/get', (req, res) => {
    connection.query('SELECT * FROM user', (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }
        res.json({ users: results });
    });
});

// API endpoint: Lấy thông tin user theo ID
router.get('/getById/:id', (req, res) => {
    const userId = req.params.id;
    connection.query('SELECT * FROM user WHERE id = ?', [userId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }
        res.json({ user: results[0] });
    });
});

// API endpoint: Thêm user mới
router.post('/add', (req, res) => {
    const { name, email, password, contact, status, role } = req.body;

    // Kiểm tra xem email đã tồn tại trong CSDL hay chưa
    connection.query('SELECT * FROM user WHERE email = ?', [email], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.length > 0) {
            // Nếu email đã tồn tại, trả về lỗi trùng lặp
            res.status(400).json({ message: 'Email đã tồn tại trong hệ thống!' });
        } else {
            // Nếu email không tồn tại, tiến hành thêm user mới
            const addUserQuery = 'INSERT INTO user (name, email, password, contact, status, role) VALUES (?, ?, ?, ?, ?, ?)';
            connection.query(addUserQuery, [name, email, password, contact, status, role], (error, results, fields) => {
                if (error) {
                    console.error('Lỗi truy vấn: ' + error);
                    res.status(500).send('Lỗi server');
                    return;
                }
                res.json({ message: 'User đã được thêm mới!' });
            });
        }
    });
});

router.put('/update/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email, password, contact, status, role } = req.body;

    // Kiểm tra xem email đã tồn tại trong CSDL hay chưa (ngoại trừ user đang được cập nhật)
    connection.query('SELECT * FROM user WHERE email = ? AND id <> ?', [email, userId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.length > 0) {
            // Nếu email đã tồn tại cho user khác, trả về lỗi trùng lặp
            res.status(400).json({ message: 'Email đã tồn tại cho một user khác trong hệ thống!' });
        } else {
            // Nếu email không tồn tại cho user khác, tiến hành cập nhật thông tin user
            const updateUserQuery = 'UPDATE user SET name = ?, email = ?, password = ?, contact = ?, status = ?, role = ? WHERE id = ?';
            connection.query(updateUserQuery, [name, email, password, contact, status, role, userId], (error, results, fields) => {
                if (error) {
                    console.error('Lỗi truy vấn: ' + error);
                    res.status(500).send('Lỗi server');
                    return;
                }
                res.json({ message: `Thông tin User có ID ${userId} đã được cập nhật!` });
            });
        }
    });
});


// API endpoint: Xóa user theo ID
router.delete('/delete/:id', (req, res) => {
    const userId = req.params.id;
    connection.query('DELETE FROM user WHERE id = ?', [userId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }
        res.json({ message: 'User đã được xóa thành công!' });
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    connection.query('SELECT * FROM user WHERE email = ?', [email], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }
        if (results.length > 0) {
            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Lỗi so sánh mật khẩu: ' + err);
                    res.status(500).send('Lỗi server');
                    return;
                }
                if (isMatch) {
                    res.json({ message: 'Đăng nhập thành công!', user });
                } else {
                    res.status(401).json({ message: 'Sai mật khẩu!' });
                }
            });
        } else {
            res.status(404).json({ message: 'Người dùng không tồn tại!' });
        }
    });
});

// API endpoint: Đăng ký
router.post('/signup', (req, res) => {
    const { name, email, password, contact, status, role } = req.body;
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Lỗi khi mã hóa mật khẩu: ' + err);
            res.status(500).send('Lỗi server');
            return;
        }
        const addUserQuery = 'INSERT INTO user (name, email, password, contact, status, role) VALUES (?, ?, ?, ?, ?, ?)';
        connection.query(addUserQuery, [name, email, hashedPassword, contact, status, role], (error, results, fields) => {
            if (error) {
                console.error('Lỗi truy vấn: ' + error);
                res.status(500).send('Lỗi server');
                return;
            }
            res.json({ message: 'Đăng ký thành công!' });
        });
    });
});

// Ví dụ cho endpoint kiểm tra email tồn tại
router.post('/check-email', (req, res) => {
    const { email } = req.body;
    connection.query('SELECT * FROM user WHERE email = ?', [email], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }
        if (results.length > 0) {
            res.json({ exists: true }); // Email tồn tại trong CSDL
        } else {
            res.json({ exists: false }); // Email không tồn tại trong CSDL
        }
    });
});


module.exports = router;