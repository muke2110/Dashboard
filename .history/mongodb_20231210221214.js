const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/records")
.then(()=>{
    console.log("Mongodb Connected");
}).catch(()=>{
    console.log("Failed");
})

const LoginSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    main:{
        type:Str
    }
    password:{
        type:String,
        required : true
    }
})


const collection = new mongoose.model("collection1",LoginSchema)

module.exports = collection