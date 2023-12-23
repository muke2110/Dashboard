const { collection_admin, collection_student } = require('../mongodb');

async function students(req, res) {
  try {
    const studentsData = await collection_student.find({ "roll_number": req.roll_number });
    res.render('student_Dashboard', { students: studentsData });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = students;
