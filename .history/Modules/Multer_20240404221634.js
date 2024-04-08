const multer = require('multer');
const path = require("path");
const { collection_history } = require('./models');

// Configure how the files are stored
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Where to store the file
        cb(null, "./Records/history");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const newFileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
        cb(null, newFileName);
    },
});

const fileFilter = (req, file, cb) => {
    // Reject a file if it's not a jpg or png
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPG, PNG, or PDF files are allowed."), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
}).fields([{ name: 'pdf', maxCount: 1 }, { name: 'xlsx', maxCount: 1 }]); // Allow only one file for each type

// Middleware to save file paths to MongoDB
const saveFilePathsToDB = async (req, res, next) => {
    if (!req.files || !req.files.pdf || !req.files.xlsx) {
        return res.status(400).json({ error: 'Both PDF and XLSX files are required.' });
    }

    try {
        const pdfPath = req.files.pdf[0].path;
        const xlsxPath = req.files.xlsx[0].path;

        // Save file paths to MongoDB
        await collection_history.create({ Pdf_path: pdfPath, xlsx_path: xlsxPath });

        next();
    } catch (error) {
        console.error('Error saving file paths to DB:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { upload, saveFilePathsToDB };
