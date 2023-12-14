const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");
const {collection_admin, collection_student} = require('./mongodb');


const port = 3000;
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static('views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/styles'));
app.use(express.static(__dirname + '/views'));

app.get("/", (req, res) => {
    res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
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

        console.log({user});

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

        console.log({ user });
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
