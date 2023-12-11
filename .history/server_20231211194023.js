const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require("bcrypt");
const collection = require('./mongodb');
const router = express.Router


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
        errors.push({ message: "Password should be at least 6 letters" });
    }

    if (password != password2) {
        errors.push({ message: "Passwords do not match" });
    }
    
    // Form validation is passed
    let hashedPassword = await bcrypt.hash(password, 10);
    console.log({
        username,
        email,
        hashedPassword
    });
    
    const data ={
        name: req.body.username,
        email:req.body.email,
        password:hashedPassword
    }
    let query = await collection.find({`"name" : "${data.name}"`})
    console.log(query);
    if(query){
    await collection.insertMany([data]);
    }else{
        errors.push({message : "User Already existed. Try to Login"});
    }
    console.log(errors);
    if (errors.length > 0) {
        res.render('signup', { errors });
    }else{
        res.render('Dashboard');
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
