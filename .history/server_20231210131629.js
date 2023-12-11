const express = require('express');
const app = express();

const port = 3000;
app.set('view engine','ejs')

app.get("/",(req,res)=>{
    res.render('login');
})

app.post('/login',(req, res)=>{
    const email = req.body.email;
    const password = req.body.password;

    console.log(`Email : ${email}\nPassword : ${password}`);
    res.render('Dashboard');
})

app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})