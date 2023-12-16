const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://muke2110:MUKESH%402110@cluster0.hucscvi.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log("Mongodb Connected");
}).catch((err)=>{
    console.log("Failed"+err);
})


//For users schema Representation

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


//For Files Schema Representation
const recordSchema = new mongoose.Schema({
    Certificate_id:{
        type:String,
        required: true
    },
    student_roll:{
        type: String,
        required: true
    },
    timestamp:{
        type: Date,
        default: Date.now
    }
})


const collection_student = new mongoose.model("collection_student",LoginSchema)
const collection_admin = new mongoose.model("collection_admin",LoginSchema)

const recordSchema

module.exports = {collection_admin,collection_student};
