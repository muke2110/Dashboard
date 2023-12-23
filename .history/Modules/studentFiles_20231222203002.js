const {collection_admin, collection_student} = require('./mongodb');


const students = await collection_student.find({ "roll_number": roll_number });
res.render('student_Dashboard', { students });
module.exports