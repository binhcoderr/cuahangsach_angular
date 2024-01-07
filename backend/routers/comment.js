const express = require('express');
const router = express.Router();
const connection = require('./connection');

// Lấy tất cả comment
router.get('/get', (req, res) => {
  connection.query('SELECT * FROM comment', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Tạo comment mới
router.post('/add', (req, res) => {
  const { post_id, product_id, user_id, content } = req.body;
  const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const update_at = created_at;
  
  const sql = 'INSERT INTO comment (post_id, product_id, user_id, content, created_at, update_at) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(sql, [post_id, product_id, user_id, content, created_at, update_at], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Thêm comment thành công', id: result.insertId });
  });
});

router.get('/comments/:id', (req, res) => {
    const commentId = req.params.id;
    const sql = 'SELECT * FROM comment WHERE id = ?';
    connection.query(sql, [commentId], (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ message: 'Không tồn tại' });
        return;
      }
      res.json(results[0]);
    });
  });
  
  // Cập nhật comment theo ID
  router.put('/comments/:id', (req, res) => {
    const commentId = req.params.id;
    const { content } = req.body;
    const update_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
    const sql = 'UPDATE comment SET content = ?, update_at = ? WHERE id = ?';
    connection.query(sql, [content, update_at, commentId], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Không tồn tại' });
        return;
      }
      res.json({ message: 'Cập nhật thành công' });
    });
  });
  

// Xóa comment
router.delete('/delete/:id', (req, res) => {
  const commentId = req.params.id;
  const sql = 'DELETE FROM comment WHERE id = ?';
  connection.query(sql, [commentId], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Xóa thành công' });
  });
});

module.exports = router;
