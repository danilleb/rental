const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { verifyToken, checkRole } = require('../utils/auth');

const router = express.Router();

const uploadPath = path.join(__dirname, '..', 'files');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadPath,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

router.post('/', verifyToken, checkRole('admin', 'manager'), upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }
    res.json({ message: 'Файл загружен', fileName: req.file.filename });
});

router.get('/:filename', (req, res) => {
    const filePath = path.join(uploadPath, req.params.filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Файл не найден' });
    }

    res.sendFile(filePath);
});

module.exports = router;
