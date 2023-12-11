const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require("bcrypt");
const collection = require('./mongodb');


const port = 3000;
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    // Add logic for login

});

app.post('/users/register', async (req, res) => {
    let { username, email, password, password2 } = req.body;

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

    // Form validation is passed
    let hashedPassword = await bcrypt.hash(password, 10);

    const data = {
        name: username,
        email: email,
        password: hashedPassword
    }

    const existingUser = await collection.findOne({ "name": data.name });

    if (existingUser) {
        errors.push({ message: "User already exists. Try to login" });
    }

    if (errors.length > 0) {
        res.render('signup', { errors });
    } else {
        await collection.insertMany(data);
        res.redirect('/Dashboard'); // Change '/dashboard' to the actual route of your dashboard
    }
});


app.get('/user/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});
