const express = require('express');
const router = express.Router();
const multer = require('multer');

const fs = require('fs');
// Kết nối đến cơ sở dữ liệu
const connection = require('../connection');

router.get('/get', (req, res) => {
    const query = 'SELECT * FROM product';
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }
        res.json(results);
    });
});

router.get('/search', (req, res) => {
    const { product } = req.query;
  
    if (!product) {
      return res.status(400).json({ error: 'Thiếu thông số sản phẩm' });
    }
  
    const searchTerm = `%${product}%`;
    const query = 'SELECT * FROM product WHERE name LIKE ?';
  
    connection.query(query, [searchTerm], (error, results, fields) => {
      if (error) {
        console.error('Lỗi tìm kiếm sản phẩm:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm nào' });
      }
  
      res.json(results);
    });
  });
  


router.get('/getById/:id', (req, res) => {
    const productId = req.params.id;

    const getProductQuery = 'SELECT * FROM product WHERE id = ?';

    connection.query(getProductQuery, [productId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Không tìm thấy sản phẩm');
            return;
        }

        const product = results[0];
        if (product && product.image) {
            product.image = product.image.replace(/\\/g, '/'); // Sửa đường dẫn từ \\ thành /
        }

        res.json(product);
    });
});

router.get('/by-category/:categoryId', (req, res) => {
    const categoryId = req.params.categoryId;

    // Thực hiện truy vấn để lấy các sản phẩm thuộc danh mục có ID tương ứng
    const getProductByCategoryQuery = 'SELECT * FROM product WHERE category_id = ?';

    connection.query(getProductByCategoryQuery, [categoryId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Không có sản phẩm nào thuộc danh mục này');
            return;
        }

        res.json(results); // Trả về danh sách sản phẩm thuộc danh mục có ID tương ứng
    });
});

router.get('/by-publish/:publishId', (req, res) => {
    const publishId = req.params.publishId;

    // Thực hiện truy vấn để lấy các sản phẩm thuộc nhà xuất bản có ID tương ứng
    const getProductByPublishQuery = 'SELECT * FROM product WHERE publish_id = ?';

    connection.query(getProductByPublishQuery, [publishId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Không có sản phẩm nào từ nhà xuất bản này');
            return;
        }

        res.json(results); // Trả về danh sách sản phẩm từ nhà xuất bản có ID tương ứng
    });
});

router.get('/by-author/:authorId', (req, res) => {
    const authorId = req.params.authorId;

    // Thực hiện truy vấn để lấy các sản phẩm của tác giả có ID tương ứng
    const getProductByAuthorQuery = 'SELECT * FROM product WHERE author_id = ?';

    connection.query(getProductByAuthorQuery, [authorId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Không có sản phẩm nào từ tác giả này');
            return;
        }

        res.json(results); // Trả về danh sách sản phẩm của tác giả có ID tương ứng
    });
});



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'upload/product/'); // Đường dẫn lưu trữ file upload
    },
    filename: function(req, file, cb) {
        const uploadPath = 'upload/product/';
        const newFileName = Date.now() + '-' + file.originalname;

        // Kiểm tra và xóa file cũ (nếu có)
        fs.access(uploadPath + newFileName, (err) => {
            if (!err) {
                // File cũ tồn tại, xóa file cũ
                fs.unlink(uploadPath + newFileName, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Không thể xóa file cũ:', unlinkErr);
                    } else {
                        console.log('Đã xóa file cũ thành công');
                    }
                });
            }
        });

        cb(null, newFileName); // Tên file sau khi lưu trữ
    }
});


const upload = multer({ storage: storage });

router.post('/add', upload.single('image'), (req, res) => {
    try {
      const { name, description, detail, size, episodes, numberpage, quantity, price, category_id, publish_id, author_id } = req.body;
  
      connection.query('SELECT * FROM product WHERE name = ?', name, (selectErr, selectResult) => {
        if (selectErr) {
          console.error('Lỗi kiểm tra sản phẩm hiện có:', selectErr);
          return res.status(500).json({ error: 'Database error', message: selectErr.message });
        }
  
        if (selectResult.length > 0) {
          // Nếu sản phẩm đã tồn tại, trả về thông báo lỗi
          return res.status(400).json({ error: 'Sản phẩm đã tồn tại', message: 'Một sản phẩm có cùng tên đã tồn tạ' });
        }
  
        const image = req.file ? req.file.path.replace(/\\/g, '/') : '';
  
        const product = {
          name: name,
          image: image,
          description: description,
          detail: detail,
          size: size,
          episodes: episodes,
          numberpage: numberpage,
          quantity: quantity,
          price: price,
          category_id: category_id,
          publish_id: publish_id,
          author_id: author_id
        };
  
        connection.query('INSERT INTO product SET ?', product, (insertErr, insertResult) => {
          if (insertErr) {
            console.error('Lỗi Thêm Sản Phẩm:', insertErr);
            return res.status(500).json({ error: 'Lỗi database', message: insertErr.message });
          }
          console.log('Thêm Sản Phẩm Thành Công:', insertResult);
          return res.status(200).json({ message: 'Thêm Sản Phẩm Thành Công', product: insertResult });
        });
      });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Lỗi server', message: err.message });
    }
  });
  

  router.put('/update/:productId', upload.single('image'), (req, res) => {
    try {
        const productId = req.params.productId; // Lấy productId từ URL
        const { name, description, detail, size, episodes, numberpage, quantity, price, category_id, publish_id, author_id } = req.body;

        // Kiểm tra xem sản phẩm có tồn tại không
        connection.query('SELECT * FROM product WHERE id = ?', productId, (selectErr, selectResult) => {
            if (selectErr) {
                console.error('Lỗi kiểm tra sản phẩm hiện có:', selectErr);
                return res.status(500).json({ error: 'Lỗi database', message: selectErr.message });
            }

            if (selectResult.length === 0) {
                // Nếu sản phẩm không tồn tại, trả về thông báo lỗi
                return res.status(404).json({ error: 'Sản phẩm không có', message: 'Không tìm thấy sản phẩm có ID đã cho' });
            }

            const image = req.file ? req.file.path.replace(/\\/g, '/') : selectResult[0].image; // Nếu không có file mới, sử dụng lại ảnh cũ

            const updatedProduct = {
                name: name || selectResult[0].name,
                image: image,
                description: description || selectResult[0].description,
                detail: detail || selectResult[0].detail,
                size: size || selectResult[0].size,
                episodes: episodes || selectResult[0].episodes,
                numberpage: numberpage || selectResult[0].numberpage,
                quantity: quantity || selectResult[0].quantity,
                price: price || selectResult[0].price,
                category_id: category_id || selectResult[0].category_id,
                publish_id: publish_id || selectResult[0].publish_id,
                author_id: author_id || selectResult[0].author_id
            };

            connection.query('UPDATE product SET ? WHERE id = ?', [updatedProduct, productId], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Lỗi cập nhật sản phẩm:', updateErr);
                    return res.status(500).json({ error: 'Lỗi database', message: updateErr.message });
                }
                console.log('Cập nhật sản phẩm thành công:', updateResult);
                return res.status(200).json({ message: 'Cập nhật sản phẩm thành công', product: updateResult });
            });
        });
    } catch (err) {
        console.error('Lỗi:', err);
        return res.status(500).json({ error: 'Lỗi server', message: err.message });
    }
});




router.delete('/delete/:id', (req, res) => {
    const productId = req.params.id;

    // Thực hiện truy vấn để xóa sản phẩm với ID tương ứng
    const deleteProductQuery = 'DELETE FROM product WHERE id = ?';

    connection.query(deleteProductQuery, [productId], (error, results, fields) => {
        if (error) {
            console.error('Lỗi truy vấn: ' + error);
            res.status(500).send('Lỗi server');
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).send('Không tìm thấy sản phẩm để xóa');
            return;
        }

        res.send('Sản phẩm đã được xóa thành công!');
    });
});


module.exports = router;