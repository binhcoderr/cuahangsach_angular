const express = require('express');
const router = express.Router();
const connection = require('../connection');

// Create a new shipping record
router.post('/add', (req, res) => {
  const {
    shipping_name,
    shipping_address,
    shipping_phone,
    shipping_note,
    shipping_status
  } = req.body;

  if (!shipping_name || !shipping_address || !shipping_phone || !shipping_note || !shipping_status) {
    return res.status(400).json({ error: 'Tất cả các trường là bắt buộc' });
  }

  const newShipping = {
    shipping_name,
    shipping_address,
    shipping_phone,
    shipping_note,
    shipping_status
  };

  connection.query('INSERT INTO shipping SET ?', newShipping, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Đã thêm vận chuyển thành công', shipping_id: result.insertId });
  });
});

// Get all shipping records
router.get('/get', (req, res) => {
  connection.query('SELECT * FROM shipping', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ data: results });
  });
});

// Update a shipping record by ID
router.put('/update/:id', (req, res) => {
  const {
    shipping_name,
    shipping_address,
    shipping_phone,
    shipping_note,
    shipping_status
  } = req.body;

  const { id } = req.params;

  const updatedShipping = {
    shipping_name,
    shipping_address,
    shipping_phone,
    shipping_note,
    shipping_status
  };

  connection.query('UPDATE shipping SET ? WHERE id = ?', [updatedShipping, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Đã cập nhật vận chuyển thành công' });
  });
});

// Delete a shipping record by ID
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  connection.query('DELETE FROM shipping WHERE id = ?', id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Shipping deleted successfully' });
  });
});

module.exports = router;
