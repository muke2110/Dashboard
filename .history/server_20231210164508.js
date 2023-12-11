const express = require('express');
const pg = require('pg');
const app = express();

const port = 3000;
app.set('view engine','ejs')
app.use(express.urlencoded({ extended: false }));

const db = new pg.Client({
    user: "postgres", 
    host: "localhost",
    database: "postgres",
    password: "Muke@2110",
    port: 5432,
});

db.connect(function err=>{
    if(err){
        throw err;
    }
    console.log("Connected");
})

app.get("/",(req,res)=>{
    res.render('login');
})

app.post('/login',(req, res)=>{
    const email = req.body.email
    const password = req.body.password;

    console.log(`Email : ${email}\nPassword : ${password}`);
    res.render('Dashboard');
})

app.get('/user/login',(req,res)=>{
    res.render('login')
})

app.get('/signup',(req,res)=>{
    res.render('signup');
})

app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})