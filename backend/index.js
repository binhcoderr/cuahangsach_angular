const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:4200', // Đổi thành domain của Angular app
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use('/upload/product',express.static('./upload/product'));
app.use('/upload/post',express.static('./upload/post'));

app.get('/', (req, res) => {
    res.send('Chào mừng đến với API của tôi!');
});


//user
const userRouter = require('./routers/user');
app.use('/user', userRouter);

// category
const categoryRouter = require('./routers/category');
app.use('/category', categoryRouter);

///publish
const publishRouter = require('./routers/publish');
app.use('/publish', publishRouter);

///author
const authorRouter = require('./routers/author');
app.use('/author', authorRouter);

//discount
const discountRouter = require('./routers/discount');
app.use('/discount', discountRouter);

//postcategories
const postcategoryRouter = require('./routers/postcategory');
app.use('/postcategory', postcategoryRouter);

//product
const productRouter = require('./routers/product');
app.use('/product', productRouter);

//upload file
const uploadRouter = require('./routers/upload');
app.use('/upload', uploadRouter);


//post
const postRouter = require('./routers/post');
app.use('/post', postRouter);

//post
const shippingRouter = require('./routers/shipping');
app.use('/shipping', shippingRouter);

//order 
const orderRouter = require('./routers/order');
app.use('/order', orderRouter);

// //bill 
// const billdetailRouter = require('./routers/billdetail');
// app.use('/billdetail', billdetailRouter);

const port = 8080;
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});