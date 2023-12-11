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
    password:{
        type:String,
        required : true
    }
})
