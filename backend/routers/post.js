const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
// Kết nối đến cơ sở dữ liệu
const connection = require('../connection');

router.get('/get', (req, res) => {
    const query = 'SELECT * FROM post';
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }
        res.json(results);
    });
});

// Lấy thông tin của một bài viết cụ thể
router.get('/getById/:id', (req, res) => {
    const postId = req.params.id;
    connection.query('SELECT * FROM post WHERE id = ?', postId, (error, results) => {
        if (error) throw error;
        res.json(results[0]);
    });
});

router.get('/by-postcategory/:postcategory_id', (req, res) => {
    const categoryId = req.params.postcategory_id;
  
    const query = `
      SELECT 
        post.id,
        post.title,
        post.image,
        post.description,
        post.content,
        post.view,
        post.author,
        post.postcategory_id
      FROM 
        post
      JOIN 
        postcategory ON post.postcategory_id = postcategory.id
      WHERE 
        postcategory.id = ?
    `;
  
    connection.query(query, [categoryId], (error, results, fields) => {
      if (error) {
        console.error('Lỗi tìm loại bài viết:', error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        return;
      }
  
      res.json(results);
    });
  });

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'upload/post/'); // Đường dẫn lưu trữ file upload
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Tên file sau khi lưu trữ
    }
});

const upload = multer({ storage: storage });

router.post('/add', upload.single('image'), (req, res) => {
    try {
        const { title, description, content, view, author, postcategory_id } = req.body;

        connection.query('SELECT * FROM post WHERE title = ?', title, (selectErr, selectResult) => {
            if (selectErr) {
                console.error('Lỗi kiểm tra bài viết hiện có:', selectErr);
                return res.status(500).json({ error: 'Lỗi database', message: selectErr.message });
            }

            if (selectResult.length > 0) {
                // Nếu bài đăng đã tồn tại, trả về thông báo lỗi
                return res.status(400).json({ error: 'Bài Viết Lỗi', message: 'Đã tồn tại bài viết' });
            }

            const image = req.file ? req.file.path.replace(/\\/g, '/') : '';

            const post = {
                title: title,
                image: image,
                description: description,
                content: content,
                view: view,
                author: author,
                postcategory_id: postcategory_id
            };

            connection.query('INSERT INTO post SET ?', post, (insertErr, insertResult) => {
                if (insertErr) {
                    console.error('Lỗi Thêm:', insertErr);
                    return res.status(500).json({ error: 'Lỗi', message: insertErr.message });
                }
                console.log('Thêm Bài Viết Thành Công:', insertResult);
                return res.status(200).json({ message: 'Thêm Bài Viết Thành Công', post: insertResult });
            });
        });
    } catch (err) {
        console.error('Lỗi:', err);
        return res.status(500).json({ error: 'Lỗi server', message: err.message });
    }
});



// Cập nhật thông tin của một bài viết
router.put('/update/:id', (req, res) => {
    const postId = req.params.id;
    const { title, image, description, content, view, author, postcategory_id } = req.body;

    // Check if the title of the post exists (excluding the post being updated)
    connection.query('SELECT * FROM post WHERE title = ? AND id != ?', [title, postId], (error, results) => {
        if (error) {
            console.error('Lỗi kiểm tra tiêu đề bài viết:', error);
            return res.status(500).send(error);
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Tiêu đề bài viết đã tồn tại. Vui lòng chọn tiêu đề khác.' });
        } else {
            const updatedPost = {
                title,
                image,
                description,
                content,
                view,
                author,
                postcategory_id,
            };

            connection.query('UPDATE post SET ? WHERE id = ?', [updatedPost, postId], (error, result) => {
                if (error) {
                    console.error('Lỗi cập nhật bài viết:', error);
                    return res.status(500).send(error);
                }
                return res.status(200).json({ message: 'Bài viết đã được cập nhật thành công.' });
            });
        }
    });
});


// Xóa một bài viết
router.delete('/delete/:id', (req, res) => {
    const postId = req.params.id;

    connection.query('DELETE FROM post WHERE id = ?', postId, (error, result) => {
        if (error) throw error;
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Không tìm thấy bài viết để xóa.' });
        } else {
            res.status(200).json({ message: 'Bài viết đã được xóa thành công.' });
        }
    });
});


module.exports = router;