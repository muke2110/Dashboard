const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");
const {collection_admin, collection_student} = require('./mongodb');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


const port = 3000;
const secretKey = 'Mukesh'; 


app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));

//Use this because data is coming in FORM data
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,'styles')))
app.use(express.static(path.join(__dirname,'views')))
app.use(cookieParser()); // Use cookie-parser middleware




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



app.get("/", (req, res) => {
    res.render('login');
});
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/admin_Dashboard', (req, res) => {
    res.render('admin_Dashboard');
});

app.get('/student_Dashboard',(req,res)=>{
    res.render('student_Dashboard');
})

app.post('/download-certificate', (req, res) => {
    try {
    const certificatePath = req.body.certificatePath;

    // Construct the full path to the certificate file
    const certificateFullPath = path.join( process.cwd(), certificatePath);

    res.setHeader('Content-Type', 'application/pdf');
    // Serve the certificate file
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

        // Handle MulterError
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                errors.push({ message: "File size is too large." });
                return res.render('admin_Dashboard', { errors });
            }
            return res.render('admin_Dashboard', { errors });
        }

        // Check if student exists
        const existingStudent = await collection_student.findOne({ "roll_number": roll_number });
        

        if (!existingStudent) {
            errors.push({ message: "Student not found." });
            return res.render('admin_Dashboard', { errors });
        }

        // No error, continue with your logic
        if (req.file) {
            const path = req.file.path; // Move this line inside the Multer middleware callback
            const id = req.body.certificate_id;
            console.log(id);
            console.log('File Mimetype:', req.file.mimetype);
            
            console.log("Valid Student");
            await collection_student.updateOne(
                { roll_number: `${roll_number}` },
                { $push: { certificate_path: `${path}` , certificate_id: `${id}`} }
            );
        } else {
            console.log("No file uploaded");
            errors.push({message : "Not a valid formate"});
            return res.render('admin_Dashboard', { errors });
        }

        // Render the dashboard after processing the request
        return res.redirect('/admin_Dashboard');
    });
});




// JWT Verification Middleware
app.use((req, res, next) => {
    const token = req.cookies.uid;

    console.log('Token:', token);

    if (req.path.toLowerCase() === '/' && !token) {
        console.log('No token and path is /, proceeding without verification.');
        return next();
    }

    if (!token) {
        console.log('No token, redirecting to /');
        return res.redirect('/');
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        console.log('Token verification successful.');
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.clearCookie('uid');
        res.redirect('/');
    }
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


        // Redirect based on user role
        if (role === 'student') {
            // Fetch students' certificates from the database
            const students = await collection_student.find({ "roll_number": roll_number });
            res.render('student_Dashboard', { students });
        } else {
            res.redirect('/admin_Dashboard');
        }

        // Create JWT token with user information
        const uid = jwt.sign({ roll_number, role }, secretKey );
        res.cookie('uid', uid, { httpOnly: true, maxAge: 3600000, path: '/' });
        
                
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




app.post('/register', async (req, res) => {
    let { username,roll_number, email, password, password2 , role} = req.body;
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

    // Form validation is passed
    let hashedPassword = await bcrypt.hash(password, saltRounds);

    const data = {
        name: username,
        roll_number,
        email: email,
        password: hashedPassword
    }
    if(role==='student'){

        //For STUDENT Account Creation
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
        
        //For ADMIN Account Creation
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
