const { collection_admin, collection_student } = require('../mongodb');

async function student(roll_number, res) {
  try {
    const result =await collection_student.find({ "roll_number": roll_number });
    return result;
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

async function admin(roll_number, res){
  try {
    
  } catch (error) {
    console.log(error)
  }
}

module.exports = student;
