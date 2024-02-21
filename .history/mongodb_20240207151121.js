const env = requi

const mongoose = require("mongoose");

const url = ;

mongoose.connect("mongodb+srv://muke2110:MUKESH%402110@cluster0.hucscvi.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log("Mongodb Connected");
}).catch((err)=>{
    console.log("Failed"+err);
})


//For users schema Representation

const student = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    roll_number:{
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
    certificate_path: {
        type: [String],
    },
    certificate_id:{
        type:[String],
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})


const admin = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    roll_number:{
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


const Issue = new mongoose.Schema({
    roll_number:{
        type:String,
        required: true
    },
    title : {
        type: String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    certificateType : {
        type : String,
        required : true
    },
    timestamp : {
        type: Date,
        default: Date.now
    }
})


const collection_student = new mongoose.model("collection_student",student)
const collection_admin = new mongoose.model("collection_admin",admin)
const issueForm = new mongoose.model("issueForm",Issue);

module.exports = { collection_admin, collection_student, issueForm};
