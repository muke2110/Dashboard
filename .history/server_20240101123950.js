const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");
const {collection_admin, collection_student} = require('./mongodb');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const {student, adminInfo} = require('./Modules/retrieveDetails');
const upload = require('./Modules/Multer');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { error } = require('console');

const port = 3000;
const secretKey = 'Project@2110';
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


//Use this because data is coming in FORM data
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname,'views')))
app.use(express.static('styles'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('student',student);
app.use('admin',adminInfo);


app.get("/", async (req, res) => {
    try {
        const token = req.cookies['uid'];

        if (token) {
            // Verify the token
            jwt.verify(token, secretKey, async (err, decoded) => {
                if (err) {
                    // If token is not valid, render the login page
                    res.render('login');
                } else {
                    // Token is valid, check the role and redirect to the respective dashboard
                    if (decoded.role === 'student') {
                        //const students = await student(decoded.roll_number, res);
                        //res.render('student_Dashboard', { students, roll_number: decoded.roll_number });
                        res.redirect('/student_Dashboard');
                    }
                    else if(decoded.role ==='admin'){
                        const name = decoded.name;
                        const user = await collection_admin.findOne({ "name": name });
                        if(user){
                            res.redirect('/admin_Dashboard');
                        }
                    }
                }
            });
        } else {
            // No token found, render the login page
            res.render('login');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/logout", (req, res) => {
    try {
        res.clearCookie('uid');
        res.redirect('/');
        } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/signup', (req, res) => {
    res.render('signup');
});


app.get('/admin_Dashboard', async(req, res) => {
    try {
        const token = req.cookies['uid'];
        if (token) {
            // Verify the token
            jwt.verify(token, secretKey, async (err, decoded) => {
                if (err) {
                    // If token is not valid, render the login page
                    res.render('login');
                }               
                else if(decoded.role === 'admin'){
                    const admin = await adminInfo(decoded.roll_number, res);
                    res.render('admin_Dashboard',{admin});
                }
            });
        } 
        else {
            // No token found, render the login page
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/admin_Dashboard/viewStudentDetails', (req, res) => {
    // Render the "viewStudentDetails" EJS file
    res.render('viewStudentDetails');
});


app.post('/admin_Dashboard/viewStudentDetails', async (req, res) => {
    try {
      const roll_number = req.body.roll_number;
  
      // Fetch student details based on the roll number
      const students = await student(roll_number, res);
  
      <!-- Assuming your EJS template file is named "viewStudentDetails.ejs" -->

<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.css"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
  <link rel="stylesheet" href="/Student.css">
  <!-- ... (your head section remains unchanged) ... -->
</head>
<body>

  <form id="logoutForm" action="/logout" method="get">
    <button type="submit"><i class="material-icons">logout</i> Log Out</button>
  </form> 

  <div class="dashboard-container"> 
    <div class="top-bar">
      <h1>STUDENT DASHBOARD</h1>  
    </div>

    <div class="student-info">
      <strong id="rollNumberLabel">Roll Number:</strong> <span id="rollNumber"></span>
    </div>

    <!-- Insert your search form here -->
    <form class="search-container" id="searchForm">
      <label for="roll-number-search">Search by Roll Number:</label>
      <input type="text" name="roll_number" id="roll-number-search" placeholder="Enter Roll Number">
      <button type="button" id="searchButton">Search</button>
    </form>

    <div id="resultContainer" style="display: none;">
      <div class="student-info" id="studentInfo">
        <!-- Student details will be displayed here -->
      </div>

      <h2>Certificates:</h2>
      <ul id="certificatesList">
        <!-- Certificates will be displayed here -->
      </ul>

      <h2>Student Table:</h2>
      <table class="student-table" border="1">
        <thead>
          <tr>
            <th>Serial Number</th>
            <th>Certification ID</th>
            <th>Certificates</th>
          </tr>
        </thead>
        <tbody id="studentTableBody">
          <!-- Student table rows will be dynamically added here -->
        </tbody>
      </table>
    </div>

    <div id="noRecords" style="display: none;">
      <p>No student details found for the provided roll number.</p>
    </div>

  </div>

  <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      document.getElementById('searchButton').addEventListener('click', function () {
        // Get roll number from the input
        const rollNumber = document.getElementById('roll-number-search').value;
  
        // Send a POST request to the server using Fetch API
        fetch('/admin_Dashboard/viewStudentDetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roll_number: rollNumber }),
        })
          .then(response => response.json())
          .then(data => {
            // Display the result container
            document.getElementById('resultContainer').style.display = 'block';
  
            console.log(data);
  
            if (data && data.student.length > 0) {
              // Display student details for the first student
              const student = data.student[0];
              document.getElementById('rollNumber').textContent = student.roll_number;
  
              // Display certificates
              const certificatesList = document.getElementById('certificatesList');
              certificatesList.innerHTML = '';
  
              if (student.certificates && student.certificates.length > 0) {
                student.certificates.forEach(function (certificate) {
                  const li = document.createElement('li');
                  li.innerHTML = '<strong>Certificate ID:</strong> ' + certificate;
                  certificatesList.appendChild(li);
                });
              } else {
                certificatesList.innerHTML = '<p>No certificates found for this student.</p>';
              }
  
              // Display student table
              const studentTableBody = document.getElementById('studentTableBody');
              studentTableBody.innerHTML = '';
              let serialNumber = 1;
  
              if (student.certificate_id && student.certificate_id.length > 0) {
                student.certificate_id.forEach(function (certificate_id) {
                  const tr = document.createElement('tr');
                  tr.innerHTML = `
                    <td>${serialNumber++}</td>
                    <td>${certificate_id}</td>
                    <td>
                      <form action="/download-certificate" method="post" style="display: inline-block">
                        <input type="hidden" name="certificatePath" value="${student.certificate_path[student.certificate_id.indexOf(certificate_id)]}">
                        <input type="hidden" name="certificateId" value="${certificate_id}">
                        <button type="submit">Download</button>
                      </form>
                      <form action="/view-certificate" method="post" target="_blank" style="display: inline-block">
                        <input type="hidden" name="certificatePath" value="${student.certificate_path[student.certificate_id.indexOf(certificate_id)]}">
                        <input type="hidden" name="certificateId" value="${certificate_id}">
                        <button type="submit">View</button>
                      </form>
                    </td>
                  `;
                  studentTableBody.appendChild(tr);
                });
              }
            } else {
              // If no records found, display a message
              document.getElementById('noRecords').style.display = 'block';
            }
          })
          .catch(function (error) {
            console.error('Error:', error);
          });
      });
    });
  </script>

</body>
</html>

      // Render the "viewStudentDetails" EJS template with the fetched data
      res.render('viewStudentDetails', { student : students, searched: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  });



app.get('/student_Dashboard',(req,res)=>{
    try {
        const token = req.cookies['uid'];

        if (token) {
            // Verify the token
            jwt.verify(token, secretKey, async (err, decoded) => {
                if (err) {
                    // If token is not valid, render the login page
                    res.redirect('login');
                } else {
                    // For student details
                    //console.log(decoded);
                    // Token is valid, check the role and redirect to the respective dashboard
                    if (decoded.role === 'student') {
                        const students = await student(decoded.roll_number, res);
                        res.render('student_Dashboard', { students, roll_number: decoded.roll_number });
                    }
                }
            });
        } else {
            // No token found, render the login page
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})


app.post('/view-certificate', (req, res) => {
    try {
      // Retrieve certificate path and certificate ID from the request
      const certificatePath = req.body.certificatePath;
  
      // Resolve the path to make it absolute
      const absolutePath = path.resolve(__dirname, certificatePath);
  
      // Add your logic to handle the viewing of the certificate here
      // For example, you might send the certificate file as a response
      res.sendFile(absolutePath);
    } catch (error) {
      console.error('Error viewing certificate:', error);
      res.status(500).send('Internal Server Error');
    }
});


app.post('/download-certificate', (req, res) => {
    try {
      const certificatePath = req.body.certificatePath;
  
      // Construct the full path to the certificate file
      const certificateFullPath = path.join( process.cwd(), certificatePath);
  
      res.setHeader('Content-Type', 'application/pdf');
      // Serve the certificate file
      // For console log the file path that is stored in the Records
      /* console.log(certificateFullPath); */
      res.download(certificateFullPath);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
});


app.post('/UploadRecords', (req, res, next) => {
    upload.single("file")(req, res, async function (err) {
        let errors = [];
        const roll_number = req.body.roll_number;

        // Handle MulterError
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                errors.push({ message: "File size is too large." });
                return res.render('admin_Dashboard', { errors });
            }
            return res.render('admin_Dashboard', { errors });
        }

        // Check if student exists
        const existingStudent = await collection_student.findOne({ "roll_number": roll_number });
        

        if (!existingStudent) {
            errors.push({ message: "Student not found." });
            return res.render('admin_Dashboard', { errors });
        }

        // No error, continue with your logic
        if (req.file) {
            const path = req.file.path; // Move this line inside the Multer middleware callback
            const id = req.body.certificate_id;
            console.log(id);
            console.log('File Mimetype:', req.file.mimetype);
            
            console.log("Valid Student");
            await collection_student.updateOne(
                { roll_number: `${roll_number}` },
                { $push: { certificate_path: `${path}` , certificate_id: `${id}`} }
            );
        } else {
            console.log("No file uploaded");
            errors.push({message : "Please fill all Information"});
            return res.render('admin_Dashboard', { errors });
        }
        // Render the dashboard after processing the request
        return res.redirect('/admin_Dashboard');
    });
});


app.post('/users/login', async (req, res) => {
    try {
        if (req.body.role === 'student') {
            const { roll_number, password } = req.body;

            let errors = [];

            if (!roll_number || !password) {
                errors.push({ message: "Please enter both username and password" });
                res.render('login', { errors });
                return;
            }

            const user = await collection_student.findOne({ "roll_number": roll_number });

            if (!user) {
                errors.push({ message: "User not found. Please check your username and try again." });
                res.render('login', { errors });    
                return;
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                errors.push({ message: "Incorrect password. Please try again." });
                res.render('login', { errors });
                return;
            }
            
            // If login is successful, create a JWT token
            const usersToken = {
                id: user._id, // Assuming MongoDB ObjectId
                roll_number: user.roll_number,
                role: req.body.role,
            };
        
            const token = jwt.sign(usersToken, secretKey);
        
            // Store the token in a secure way (e.g., in a cookie or client-side storage)
            res.cookie('uid', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // Set the expiration time as needed
            res.redirect('/student_Dashboard');

        } else {
            const { roll_number, password } = req.body;

            let errors = [];

            if (!roll_number || !password) {
                errors.push({ message: "Please enter both username and password" });
                res.render('login', { errors });
                return;
            }

            const user = await collection_admin.findOne({ "name": roll_number });

            if (!user) {
                errors.push({ message: "User not found. Please check your username and try again." });
                res.render('login', { errors });
                return;
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                errors.push({ message: "Incorrect password. Please try again." });
                res.render('login', { errors });
                return;
            }
            // If login is successful, create a JWT token
            const usersToken = {
                id: user._id, // Assuming MongoDB ObjectId
                name: roll_number,
                role: req.body.role,
            };
        
            const token = jwt.sign(usersToken, secretKey);
        
            // Store the token in a secure way (e.g., in a cookie or client-side storage)
            res.cookie('uid', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // Set the expiration time as needed
  

            // Login successful, you can set a session or token here (if needed)
            res.redirect('/admin_Dashboard');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/register', async (req, res) => {
    let { username,roll_number, email, password, password2 , role} = req.body;
    let errors = [];

    if (!username || !email || !roll_number || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters" });
    }

    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }

    const saltRounds = 10;

    // Form validation is passed
    let hashedPassword = await bcrypt.hash(password, saltRounds);

    const data = {
        name: username,
        roll_number,
        email: email,
        password: hashedPassword
    }
    if(role==='student'){

        //For STUDENT Account Creation
        const existingUser = await collection_student.findOne({ "roll_number": data.name });

        if (existingUser) {
            errors.push({ message: "Student already exists. Try to login" });
        }

        if (errors.length > 0) {
            res.render('signup', { errors });
        } else {
            await collection_student.insertMany(data);
            res.render('login');
        }
    } else {
        
        //For ADMIN Account Creation
        const existingUser = await collection_admin.findOne({ "roll_number": data.name });

        if (existingUser) {
            errors.push({ message: "Admin already exists. Try to login" });
        }

        if (errors.length > 0) {
            res.render('signup', { errors });
        } else {
            await collection_admin.insertMany(data);
            res.render('login');
        }
    }
});


app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});