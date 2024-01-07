const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Thiết lập Multer để lưu trữ file tải lên
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'upload/') // Thư mục để lưu trữ file
    },
    filename: function(req, file, cb) {
        const filePath = path.join('upload/', file.originalname);
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (!err) {
                // Nếu file đã tồn tại, đổi tên file mới
                cb(null, Date.now() + '-' + file.originalname); // Thêm thời gian vào tên file để đảm bảo duy nhất
            } else {
                // Nếu file chưa tồn tại, sử dụng tên file gốc
                cb(null, file.originalname);
            }
        });
    }
});

// Khởi tạo upload middleware
const upload = multer({ storage: storage });

// Định nghĩa route API cho việc upload file
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Vui lòng tải lên một file');
    }

    res.send('File đã được tải lên thành công');
});

module.exports = router;