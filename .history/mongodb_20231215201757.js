const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://muke2110:MUKESH%402110@cluster0.hucscvi.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log("Mongodb Connected");
}).catch((err)=>{
    console.log("Failed"+err);
})


//For users schema Representation

db.Students.update(
    { studentId: 1 },
    {
      $push: {
        certificates: {
          certificateId: 123,
          type: "Sports",
          // Other certificate-related fields
        }
      }
    }
  )


const collection_student = new mongoose.model("collection_student",LoginSchema)
const collection_admin = new mongoose.model("collection_admin",LoginSchema)


module.exports = { collection_admin, collection_student };
