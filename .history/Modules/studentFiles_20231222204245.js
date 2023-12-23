const { collection_admin, collection_student } = require('../mongodb');

async function students(req, res) {
  try {
    return  studentsData = await collection_student.find({ "roll_number": req.roll_number });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = students;
