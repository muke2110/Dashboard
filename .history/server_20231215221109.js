const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");
const {collection_admin, collection_student} = require('./mongodb');
const multer = require('multer');

const port = 3000;
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));


//Use this because data is coming in FORM data
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname,'styles')))
app.use(express.static(path.join(__dirname,'views')))


//configure how the files are stored
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //where to store the file
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
//reject a file if it's not a jpg or png
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "application/pdf"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});
  


app.get("/", (req, res) => {
    res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});


app.post('/UploadRecords', upload.single("file"), (req, res) => {
    console.log(req.file);
    console.log(req.body.roll_number);
    console.log(req.body.certificate_id);
    console.log(req.file.path);
    console.log(req.body.certificate_type);

    res.render('admin_Dashboard');
    //Need to store the file name to Database
    const roll_number = req.body.
});


app.post('/users/login', async (req, res) => {
    const { name, password } = req.body;

    if(req.body.role =='student'){
        console.log(req.body.role);

        let errors = [];

        if (!name || !password) {
            errors.push({ message: "Please enter both username and password" });
            res.render('login', { errors });
            return;
        }

        const user = await collection_student.findOne({ "name": name });

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

        // Login successful, you can set a session or token here
        res.render('student_Dashboard');
    } else{
        console.log(req.body.role);

        let errors = [];

        if (!name || !password) {
            errors.push({ message: "Please enter both username and password" });
            res.render('login', { errors });
            return;
        }

        const user = await collection_admin.findOne({ "name": name });

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

        // Login successful, you can set a session or token here
        res.render('admin_Dashboard');
    } 
});


app.post('/register', async (req, res) => {
    let { username, email, password, password2 , role} = req.body;
    let errors = [];

    if (!username || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters" });
    }

    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }

    const saltRounds = 10;

    // Form validation is passed
    let hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log({
        username,
        email,
        hashedPassword
    })
    const data = {
        name: username,
        email: email,
        password: hashedPassword
    }
    if(role==='student'){

        //For STUDENT Account Creation
        const existingUser = await collection_student.findOne({ "name": data.name });

        if (existingUser) {
            errors.push({ message: "User already exists. Try to login" });
        }

        if (errors.length > 0) {
            res.render('signup', { errors });
        } else {
            await collection_student.insertMany(data);
            res.render('login');
        }
    } else {
        
        //For ADMIN Account Creation
        const existingUser = await collection_admin.findOne({ "name": data.name });

        if (existingUser) {
            errors.push({ message: "User already exists. Try to login" });
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
