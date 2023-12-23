const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");
const { collection_student } = require('./mongodb'); // Remove if collection_admin is not used
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const port = 3000;
const secretKey = 'Mukesh';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'views')));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./Records");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const newFileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
        cb(null, newFileName);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "application/pdf"
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
});

// Routes

app.get("/", async (req, res) => {
    if (req.user && req.user.role === 'student') {
        const students = await collection_student.find({ "roll_number": req.user.roll_number });
        res.render('student_Dashboard', { students });
    } else if (req.user && req.user.role === 'admin') {
        return res.redirect('/admin_Dashboard');
    }
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/admin_Dashboard', (req, res) => {
    res.render('admin_Dashboard');
});

app.get('/student_Dashboard', (req, res) => {
    res.render('student_Dashboard');
});

app.post('/download-certificate', (req, res) => {
    try {
        const certificatePath = req.body.certificatePath;
        const certificateFullPath = path.join(process.cwd(), certificatePath);

        res.setHeader('Content-Type', 'application/pdf');
        console.log(certificateFullPath);
        res.download(certificateFullPath);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/UploadRecords', (req, res, next) => {
    upload.single("file")(req, res, async function (err) {
        let errors = [];
        const roll_number = req.body.roll_number;

        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                errors.push({ message: "File size is too large." });
            } else {
                errors.push({ message: err.message });
            }
            return res.render('admin_Dashboard', { errors });
        }

        const existingStudent = await collection_student.findOne({ "roll_number": roll_number });

        if (!existingStudent) {
            errors.push({ message: "Student not found." });
            return res.render('admin_Dashboard', { errors });
        }

        if (req.file) {
            const path = req.file.path;
            const id = req.body.certificate_id;
            console.log(id);
            console.log('File Mimetype:', req.file.mimetype);

            console.log("Valid Student");
            await collection_student.updateOne(
                { roll_number: `${roll_number}` },
                { $push: { certificate_path: `${path}`, certificate_id: `${id}` } }
            );
        } else {
            console.log("No file uploaded");
            errors.push({ message: "Not a valid format" });
            return res.render('admin_Dashboard', { errors });
        }

        return res.redirect('/admin_Dashboard');
    });
});

app.post('/users/login', async (req, res) => {
    try {
        const { roll_number, password, role } = req.body;
        let errors = [];

        if (!roll_number || !password) {
            errors.push({ message: "Please enter both username and password" });
            res.render('login', { errors });
            return;
        }

        let user;

        if (role === 'student') {
            user = await collection_student.findOne({ "roll_number": roll_number });
        } else {
            // Assuming collection_admin is a valid collection
            user = await collection_admin.findOne({ "name": roll_number });
        }

        if (!user) {
            errors.push({ message: "User not found. Please check your username and try again." });
            res.render('login', { errors });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            errors.push({ message: "Incorrect password. Please try again." });
            res.render('login', { errors });
            return;
        }

        const User = {
            roll_number,
            role
        };

        const token = jwt.sign(User, secretKey);

        res.cookie('uid', token, {
            httpOnly: true,
            maxAge: 3600000,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        if (role === 'student') {
            const students = await collection_student.find({ "roll_number": roll_number });
            res.render('student_Dashboard', { students });
        } else {
            res.redirect('/admin_Dashboard');
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/register', async (req, res) => {
    let { username, roll_number, email, password, password2, role } = req.body;
    let errors = [];

    if (!username || !email || !roll_number || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters" });
    }

    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }

    const saltRounds = 10;

    let hashedPassword = await bcrypt.hash(password, saltRounds);

    const data = {
        name: username,
        roll_number,
        email: email,
        password: hashedPassword
    };

    if (role === 'student') {
        const existingUser = await collection_student.findOne({ "roll_number": data.name });

        if (existingUser) {
            errors.push({ message: "Student already exists. Try to login" });
        }

        if (errors.length > 0) {
            res.render('signup', { errors });
        } else {
            await collection_student.insertMany(data);
            res.render('login');
        }
    } else {
        // Assuming collection_admin is a valid collection
        const existingUser = await collection_admin.findOne({ "roll_number": data.name });

        if (existingUser) {
            errors.push({ message: "Admin already exists. Try to login" });
        }

        if (errors.length > 0) {
            res.render('signup', { errors });
        } else {
            await collection_admin.insertMany(data);
            res.render('login');
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});
