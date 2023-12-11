const express = require('express');
const app = express();

const port = 3000;
app.set('view engine','ejs')

app.get("/",(req,res)=>{
    res.render('login')
})

app.post('/login',(req, res)=>{
    const email = 'muke2110'
})

app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})