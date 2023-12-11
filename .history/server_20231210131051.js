const express = require('express');
const app = express();

const port = 3000;
app.use("set engine','ejs')

app.get("/",(req,res)=>{
    res.render('/login')
})

app.listen(port,()=>{
    console.log(`Server is running at ${port}`);
})