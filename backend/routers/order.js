    const express = require('express');
    const router = express.Router();
    const connection = require('../connection');
 
    // GET ALL ORDERS
    router.get('/get', (req, res) => {
        connection.query('SELECT * FROM orders', (error, results, fields) => {
            if (error) {
                res.json(error);
            } else {
                if (results.length > 0) {
                    res.json(results);
                } else {
                    res.json({ message: "Không tìm thấy đơn hàng nào" });
                }
            }
        });
    });

    // LẤY ORDER THEO ID
    router.get('/getById/:id', (req, res) => {
        let orderId = req.params.id;
    
        connection.query('SELECT * FROM orders where id=?', orderId, (error, results, fields) => {
            if (error) {
                res.json(error);
            } else {
                if (results.length > 0) {
                    res.json(results[0]);
                } else {
                    res.json({ message: "Không tìm thấy đơn hàng" });
                }
            }
        });
    });

    router.get('/details', (req, res) => {
      // Execute SQL query to fetch all orders_details
      const sqlQuery = 'SELECT * FROM orders_details';
    
      // Assuming you're using a database connection pool or ORM
      // Execute the SQL query to fetch all orders_details
      connection.query(sqlQuery, (err, result) => {
        if (err) {
          console.error('Error fetching orders_details:', err);
          res.status(500).json({ error: 'Error fetching orders_details' });
        } else {
          // Send the retrieved data as a JSON response
          res.json(result);
        }
      });
    });

    router.get('/getByOrderId/:orderId', (req, res) => {
      const orderId = req.params.orderId;
    
      connection.query(
        'SELECT * FROM orders_details WHERE order_id = ?',
        orderId,
        (error, results, fields) => {
          if (error) {
            res.status(500).json({ message: 'Lỗi khi lấy chi tiết đơn hàng', error: error });
          } else {
            res.status(200).json(results);
          }
        }
      );
    });

    router.get('/getOrderByProduct/:id', (req, res) => {
      const Id = req.params.id;
      const query = `SELECT f.*, orders_details.quantity, orders_details.subtotal
                     FROM orders_details
                     JOIN product AS f ON f.id = orders_details.product_id
                     WHERE orders_details.order_id = ?`;
    
      connection.query(query, [Id], (err, results) => {
          if (err) {
              res.status(500).json({ error: err });
              return;
          }
    
          if (results.length === 0) {
              res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
              return;
          }
    
          res.status(200).json(results);
      });
    });

    // ĐẶT ĐƠN HÀNG MỚI
   
    router.post('/add', async (req, res) => {
      const { user_id, products, name,lienhe,address, note, payment, status } = req.body;
    
      if (user_id !== null && user_id > 0 && products.length > 0) {
        try {
          const insertOrderQuery = 'INSERT INTO orders SET ?';
          const orderData = {
            user_id,
            total_amount: 0,
            name:name||'',
            lienhe:lienhe||'',
            address: address || '',
            status: status || 'chưa giao hàng',
            note: note || '',
            created_at: new Date(),
            updated_at: new Date(),
            payment: payment || ''
          };
    
          connection.beginTransaction(async (err) => {
            if (err) throw err;
    
            try {
              const insertedOrder = await new Promise((resolve, reject) => {
                connection.query(insertOrderQuery, orderData, (error, results) => {
                  if (error) {
                    connection.rollback(() => {
                      reject(error);
                    });
                  } else {
                    resolve(results);
                  }
                });
              });
    
              const orderId = insertedOrder.insertId;
              let totalAmount = 0;
    
              for (const p of products) {
                const [productInfo] = await new Promise((resolve, reject) => {
                  const productInfoQuery = 'SELECT * FROM product WHERE id = ?';
                  connection.query(productInfoQuery, p.id, (error, results) => {
                    if (error) {
                      connection.rollback(() => {
                        reject(error);
                      });
                    } else {
                      resolve(results);
                    }
                  });
                });
    
                const inCart = parseInt(p.quantity);
    
                if (productInfo && productInfo.quantity >= inCart) {
                  const totalPrice = parseFloat(productInfo.price) * inCart;
                  totalAmount += totalPrice;
    
                  const insertOrderDetailsQuery = 'INSERT INTO orders_details SET ?';
                  const orderDetailsData = {
                    order_id: orderId,
                    product_id: p.id,
                    quantity: inCart,
                    subtotal: totalPrice,
                    created_at: new Date(),
                    updated_at: new Date()
                  };
    
                  await new Promise((resolve, reject) => {
                    connection.query(insertOrderDetailsQuery, orderDetailsData, (error) => {
                      if (error) {
                        connection.rollback(() => {
                          reject(error);
                        });
                      } else {
                        resolve();
                      }
                    });
                  });
    
                  await new Promise((resolve, reject) => {
                    const updateProductQuery = 'UPDATE product SET quantity = quantity - ? WHERE id = ?';
                    connection.query(updateProductQuery, [inCart, p.id], (error) => {
                      if (error) {
                        connection.rollback(() => {
                          reject(error);
                        });
                      } else {
                        resolve();
                      }
                    });
                  });
                } else {
                  connection.rollback(() => {
                    res.json({ message: `Sản phẩm ${productInfo.name} không đủ số lượng để đặt hàng`, success: false });
                  });
                  return;
                }
              }
    
              const updateOrderTotalQuery = 'UPDATE orders SET total_amount = ? WHERE id = ?';
              await new Promise((resolve, reject) => {
                connection.query(updateOrderTotalQuery, [totalAmount, orderId], (error) => {
                  if (error) {
                    connection.rollback(() => {
                      reject(error);
                    });
                  } else {
                    resolve();
                  }
                });
              });
    
              connection.commit((err) => {
                if (err) {
                  connection.rollback(() => {
                    throw err;
                  });
                } else {
                  res.json({
                    message: `Đã đặt đơn hàng thành công với id đơn hàng ${orderId}`,
                    success: true,
                    order_id: orderId,
                    products
                  });
                }
              });
            } catch (error) {
              connection.rollback(() => {
                res.json(error);
              });
            }
          });
        } catch (err) {
          res.json(err);
        }
      } else {
        res.json({ message: 'Đặt đơn hàng mới không thành công', success: false });
      }
    });
    
    // PUT endpoint để chỉnh sửa trường status trong đơn hàng có id cụ thể
    router.patch('/updateStatus/:orderId', (req, res) => {
      const orderId = req.params.orderId;
      const newStatus = req.body.status;
    
      const updateStatusQuery = 'UPDATE orders SET status = ? WHERE id = ?';
    
      connection.query(updateStatusQuery, [newStatus, orderId], (error, results) => {
        if (error) {
          res.status(500).json({ error: 'Không cập nhật được trạng thái đơn hàng' });
        } else {
          if (results.affectedRows > 0) {
            res.status(200).json({ message: 'Trạng thái đơn hàng được cập nhật thành công' });
          } else {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
          }
        }
      });
    });
    

   
    
    
    

    // Payment Gateway
    router.post('/payment', async (req, res) => {
        try {
            // Giả lập thời gian chờ 3 giây trước khi trả về kết quả thành công
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 3000);
            });
    
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });
    
    module.exports = router;
