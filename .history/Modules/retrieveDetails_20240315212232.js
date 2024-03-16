const { collection_admin, collection_student, issueForm} = require('../mongodb');

async function student(roll_number, res) {
  try {
    const result =await collection_student.find({ "roll_number": roll_number });
    return result;
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

async function adminInfo(roll_number, res){
  try {
    const result = await collection_admin.find({ "roll_number": roll_number });
    return result
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
}

async function issues(res){
  try {
    const issues = await issueForm.find().sort({ date: -1 }); // Fetch issues and sort by date in descending order
    return issues
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function emailRetrieve(role, email, res){
  try{
    if(role === 'student'){
      const result = await collection_student.find({"email": email})
      console.log(result)
      return result
    } else {
      const result = await collection_admin.find
    }
  }
}

module.exports = {student , adminInfo, issues};
