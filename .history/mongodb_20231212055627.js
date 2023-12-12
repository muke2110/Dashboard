const mongoose = require("mongoose");




const LoginSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required : true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})


const collection = new mongoose.model("collection1",LoginSchema)

module.exports = collection