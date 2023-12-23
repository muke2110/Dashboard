const { collection_admin, collection_student } = require('../mongodb');

async function student(req, res) {
  try {
    result =await collection_student.find({ "roll_number": req.roll_number });
    console.log(res)
    return result;
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = student;
