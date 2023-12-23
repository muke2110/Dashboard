const { collection_admin, collection_student } = require('../mongodb');

async function student(req, res) {
  try {
    return resawait collection_student.find({ "roll_number": req.roll_number });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = student;
