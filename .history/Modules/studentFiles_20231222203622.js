const {collection_admin, collection_student} = require('../mongodb');

async function students(roll_numb,res){
const students = await collection_student.find({ "roll_number": roll_number });
res.render('/student_Dashboard', { students });
}
module.exports = students