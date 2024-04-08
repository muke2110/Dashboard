const multer = require('multer');
const path = require("path");

//configure how the files are stored
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //where to store the file
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
    //reject a file if it's not a jpg or png
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
        cb(null, true);
    }else {
        cb(new Error("Invalid file type. Only JPG, PNG, or PDF files are allowed."), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});


module.exports = upload;
