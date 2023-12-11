const express = require('express');
const app = express();

const port = 3000;
app.set('view engine','ejs')
app.use(express.urlencoded({ extended: false }));

app.get("/",(req,res)=>{
    res.render('login');
})

app.post('/login',(req, res)=>{
    const  = req.body.password;

    console.log(`Email : ${email_name}\nPassword : ${password_name}`);
    res.render('Dashboard');
})

app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})