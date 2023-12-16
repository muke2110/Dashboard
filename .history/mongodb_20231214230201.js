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
const records = new mangoose.s


const collection_student = new mongoose.model("collection_student",LoginSchema)
const collection_admin = new mongoose.model("collection_admin",LoginSchema)


module.exports = {collection_admin,collection_student};
