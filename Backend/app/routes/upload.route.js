const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // 1. Thêm module 'fs' (File System)

const router = express.Router();

// 1. Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  // Định nghĩa thư mục đích để lưu file
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../uploads/");

    // 2. Kiểm tra và tạo thư mục nếu nó chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  // Đổi tên file để tránh trùng lặp
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// 2. Khởi tạo middleware multer với cấu hình storage
const upload = multer({ storage: storage });

// 3. Tạo route POST '/'. Middleware upload.single('image') sẽ xử lý file
// 'image' là key mà bạn đã đặt ở frontend: formData.append('image', file)
router.post("/", upload.single("image"), (req, res) => {
  // Nếu không có file, báo lỗi
  if (!req.file) {
    return res.status(400).json({ message: "Vui lòng chọn một file để upload." });
  }

  // 4. Trả về URL của file đã upload
  // URL này sẽ được dùng để hiển thị ảnh ở frontend
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.json({ url: fileUrl });
});

module.exports = router;