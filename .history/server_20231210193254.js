const express = require('express');
const pg = require('pg');
const app = express();
const bcrypt = require("bcrypt");

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "project",
    password: "Muke@2110",
    port: 5432,
  });
  db.connect();

const port = 3000;
app.set('view engine','ejs')
app.use(express.urlencoded({ extended: false }));


app.get("/",(req,res)=>{
    res.render('login');
})

app.post('/login',(req, res)=>{

})

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
    } else  {
        // Form validation is passed

        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        try {
            const result = await db.query(
                // Use db.query instead of pool.query
                `SELECT * FROM users WHERE email = $1`,
                [email]
            );

            console.log(result.rows);
        } catch (err) {
            console.error(err);
            res.send("Error during database query");
        }

});


app.get('/user/login',(req,res)=>{
    res.render('login')
})

app.get('/signup',(req,res)=>{
    res.render('signup');
})

app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})