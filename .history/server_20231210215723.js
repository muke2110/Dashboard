const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require("bcrypt");

mongoose.connect("mongodb://localhost:27017/records")
.then(()=>{
    console.log("Mongodb Connected");
}).catch(()=>{
    console.log("Failed");
})

const LoginSch

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
    console.log({
        username,
        email,
        password,
        password2
    });

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

    if (errors.length > 0) {
        res.render('signup', { errors });
    } else {
        // Form validation is passed

        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        try {
            const result = await db.query(
                `SELECT * FROM users WHERE email = $1`,
                [email]
            );

            console.log(result.rows);
        } catch (err) {
            console.error(err);
            res.send("Error during database query");
        }
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
