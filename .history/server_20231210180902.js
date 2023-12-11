const express = require('express');
const pg = require('pg');
const {pool}= require("./dbConfig");
const app = express();

const port = 3000;
app.set('view engine','ejs')
app.use(express.urlencoded({ extended: false }));


app.get("/",(req,res)=>{
    res.render('login');
})

app.post('/login',(req, res)=>{
    const email = req.body.email
    const password = req.body.password;

    console.log(`Email : ${email}\nPassword : ${password}`);
    res.render('Dashboard');
})

app.post('/user/register',(req,res)=>{
    let {name,email,password,password2}
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