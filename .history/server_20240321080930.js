const express = require('express');
const fs = require('fs');
const path = require("path");
const bcrypt = require("bcryptjs");
const {collection_admin, collection_student, issueForm} = require('./mongodb');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator')
const { student, adminInfo, emailRetrieve } = require('./Modules/retrieveDetails');
const { sendEmailWithAttachment, sendOTP } = require('./Modules/bulkUploadHandler')
const upload = require('./Modules/Multer');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');

const port = 3000;
const app = express();
const secretKey = 'Project@College';
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


//Use this because data is coming in FORM data
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,'views')))
app.use(express.static('styles'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('student',student);
app.use('admin',adminInfo);


//GET routes
//REDIRECTS TO RESPECTED DASHBOARDS
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
            res.clearCookie('Token')
            // No token found, render the login page
            res.render('login');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
//logout REST API
app.get("/logout", (req, res) => {
    try {
        res.clearCookie('uid');
        res.redirect('/');
        } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
//Signup REST API
app.get('/signup', (req, res) => {
    res.render('signup');
});
//ADMIN DASHBOARD REST API
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
                else if(decoded.role != 'admin'){
                    res.redirect()
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
//ADMIN PRIVILEGE TO CHECK STUDENT CERTIFICATES
app.get('/admin_Dashboard/viewStudentDetails', (req, res) => {
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
                    res.render('viewStudentDetails');
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
//ADMIN PRIVILEGE TO UPLOAD CERTIFICATES IN BULK BY USING EXCEL SHEET (.xlsx)
app.get('/admin_Dashboard/uploadCertificates', (req, res) => {
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
                    res.render('uploadCertificates');
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
//PAGE FOR FORGET PASSWORD
app.get('/forgetPassword',(req,res)=>{
    res.render('forgetPage');
})
//PAGE FOR VALIDATING THE OTP
app.get('/verificationPage', (req, res) => {
    const token = req.cookies['Token'];

    // Check if token exists
    if (!token) {
        return res.redirect("/");
    }

    // Verify the token
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid token');
        }

        // If token is valid, render the verification page
        res.render('verificationPage');
    });
});

//To Count Total APP-POINTS And it is going to fetch
app.get('/total-app-points', async (req, res) => {
    try {
        // Extract UID from JWT token
        const token = req.cookies['uid']; // Assuming token is sent in the Authorization header
        const decoded = jwt.verify(token, secretKey); // Verify and decode the token
        const roll_number = decoded.roll_number; // Extract UID from decoded token

        // Find user by UID and calculate total app points
        const student = await collection_student.findOne({ roll_number }); 
        console.log(student);
        let totalAppPoints = 0;
        if (student) {
            student.app_points.forEach(points => {
                totalAppPoints += parseInt(points); // Convert string to number
            });
            res.json(totalAppPoints);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//ADMIN LOOKS INTO ANY ISSUES FACED BY STUDENT
app.get('/student-Issues', async(req, res) => {
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
                    // Assuming you fetch issues from MongoDB and store them in the `issues` variable
                    const issues = await issueForm.find().sort({ date: -1 });
                    // console.log(issues);
                    // Render the studentIssues.ejs template and pass the issues variable
                    res.render('studentIssues', { issues });
                } else {
                    res.status(500).send('Access Denied')
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
//STUDENT DASHBOARD REST API
app.get('/student_Dashboard', async (req, res) => {
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
                    if (decoded.role === 'student') {
                        const students = await student(decoded.roll_number, res);
                        // console.log(students)
                        // Check if 'success' query parameter is true and include a successMessage
                        const success = req.query.success === 'true';
                        console.log(students[0].app_points.length)
                        res.render('student_Dashboard', { students, roll_number: decoded.roll_number, successMessage: success ? 'Issue reported successfully!' : null });
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
});
//STUDENT REPORTS ISSUES
app.get('/report-issue', (req, res) => {
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
                    // Token is valid, check the role and redirect to the respective dashboard
                    if (decoded.role === 'student') {
                        res.render('report-issue');
                    } else {
                        res.status(500).send('Access Denied')
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
});



//POST ROUTES

//ADMIN PRIVILEGE FOR ViewStudentDetails
app.post('/admin_Dashboard/viewStudentDetails', async (req, res) => {
    try {
      const roll_number = req.body.roll_number;
  
      // Fetch student details based on the roll number
      const students = await student(roll_number, res);
  
    //console.log('Data sent to EJS:', { student: students, searched: true });

      // Render the "viewStudentDetails" EJS template with the fetched data
      res.json({ student: students, searched: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
});
//ADMIN PRIVILEGE FOR Upload Bulk Certificate
app.post('/admin_Dashboard/uploadCertificates', upload.single('file'), async (req, res) => {
    try {
        // Ensure a file was uploaded
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Read Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        // Iterate over each entry in the Excel data
        for (let index = 0; index < data.length; index++) {
            const entry = data[index];
            console.log(entry);
            const { name, email, 'event name': eventName, 'roll number': roll_number, "App Points": app_points } = entry;

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E5);

            // Create a new PDF document for each entry
            const pdfPath = path.join(__dirname, 'Records', `${uniqueSuffix}.pdf`);
            const relativePdfPath = path.relative(__dirname, pdfPath);
            console.log(relativePdfPath)
            const doc = new PDFDocument();
            doc.pipe(fs.createWriteStream(pdfPath));

            // Add content to the PDF
            doc.fontSize(20).text(`Certificate for ${name}`, { align: 'center' });
            doc.fontSize(14).text(`Email: ${email}`, { align: 'center' });
            doc.fontSize(14).text(`Event: ${eventName}`, { align: 'center' });

            // Finalize the PDF
            doc.end();

            // Send email with PDF attachment
            await sendEmailWithAttachment(email, pdfPath, name, eventName);

            // Upload PDF to MongoDB for respective student
            const existingStudent = await collection_student.findOne({ "roll_number": roll_number });

            if (!existingStudent) {
                console.error("Student not found in the database.");
                // Handle error appropriately, maybe log it or return a response
                continue; // Skip to the next iteration if student not found
            }

            // Update student document with certificate information
            await collection_student.updateOne(
                { roll_number: `${roll_number}` },
                { $push: { 
                    certificate_path: `${relativePdfPath}`,
                    certificate_id: `${uniqueSuffix}`,
                    certificate_date: new Date(), // Assuming current date
                    certificate_type: eventName, // You can modify this as needed
                    app_points: app_points,
                } }
            );
            console.log(`Updated on ${roll_number} Data`)
        }
        console.log("All files generated certificates");
        res.send('Certificates generated, sent, and uploaded successfully.');
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file.');
    }
});
//STUDENTS GETS THEIR CERTIFICATES
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
//STUDENT CAN SUBMIT THERE ISSUES
app.post('/submit-issue', async (req, res) => {
    try {
        // Extract JWT token from cookie
        const token = req.cookies.uid;
        // Check if token exists
        if (!token) {
            return res.redirect('/');
        }
        // Verify JWT to ensure user is logged in
        const decodedToken = jwt.verify(token, secretKey); // Replace 'your_secret_key' with your actual secret key

        // Extract roll_number from decoded token
        const roll_number = decodedToken.roll_number;

        // Create a new issue document
        const newIssue = new issueForm({
            roll_number: roll_number,
            title: req.body.title,
            description: req.body.description,
            certificateType: req.body.certificateType
        });

        // Save the new issue document to the database
        await newIssue.save();

        // Redirect to student dashboard
        res.redirect('/student_Dashboard?success=true');
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.redirect('/');
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
//STUDENT CAN DOWNLOAD THEIR CERTIFICATES
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
//ADMIN PRIVILEGE TO UPLOAD CERTIFICATE TO RESPECTED STUDENT
app.post('/UploadRecords', (req, res, next) => {
    upload.single("file")(req, res, async function (err) {
        let errors = [];
        const roll_number = req.body.roll_number;
        console.log(req.body)
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
            // console.log(req.file);
            const path = req.file.path; // Move this line inside the Multer middleware callback
            const id = req.body.certificate_id;
            const date = req.body.certificate_date;
            const type = req.body.certificate_type;
            // console.log(id);
            // console.log('File Mimetype:', req.file.mimetype);
            console.log(path);
            
            console.log("Valid Student");
            await collection_student.updateOne(
                { roll_number: `${roll_number}` },
                { $push: { certificate_path: `${path}` , certificate_id: `${id}` , certificate_date: `${date}`, certificate_type: `${type}`} }
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
//LOGIN PAGE FOR USERS (STUDENT or ADMIN)
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
//REGISTRATION FOR BOTH STUDENT OR ADMIN
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

//FORGET PASSWORD STEP-1 ( OTP GENERATION )
app.post('/forgetPassword', async (req, res) => {
    console.log(req.body);
    const { identifier: email, role } = req.body;

    try {
        // Retrieve user information from the database
        const user = await emailRetrieve(role, email, res);
        console.log('Retrieved user:', user);

        // Check if user exists
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Generate OTP (you can use any library for this)
        const otp = otpGenerator.generate(6, { digits: true });
        console.log('Generated OTP:', otp);

        // Update or insert OTP into the user document
        if (role === 'student') {
            await collection_student.updateOne(
                { email },
                { $push: { resetOTP: otp } }
            );
        } else if (role === 'admin') {
            await collection_admin.updateOne(
                { email },
                { $push: { resetOTP: otp } }
            );
        } else {
            return res.status(400).send('Invalid role');
        }

        // Send OTP via email (assuming this function exists)
        await sendOTP(email, otp);

        // Create JWT token with user information
        const usersToken = {
            email: email,
            role: role,
        };
        const token = jwt.sign(usersToken, secretKey);

        // Store the token in a secure way (e.g., in a cookie or client-side storage)
        res.cookie('Token', token, { httpOnly: true, maxAge: 10 * 60 * 1000 }); //stores only 10 minutes

        // Redirect to verification page
        res.redirect("/verificationPage");
 
    } catch (error) {
        console.error('Error in forgetPassword route:', error);
        res.status(500).send('Server Error');
    }
});

//FORGET PASSWORD STEP-2 ( OTP VALIDATION )
app.post('/verifyAndResetPassword', async (req, res) => {
    const { otp, password, confirmPassword } = req.body;
    const token = req.cookies['Token'];

    // Check if token exists
    if (!token) {
        return res.status(401).send('Token not provided');
    }

    // Verify the token
    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid token');
        }
        
        // Extract decoded email and role
        const decodedEmail = decoded.email;
        const role = decoded.role;

        try {
            let user;

            // Find user based on role
            if (role === 'student') {
                user = await collection_student.findOne({ email: decodedEmail });
            } else if (role === 'admin') {
                user = await collection_admin.findOne({ email: decodedEmail });
            } else {
                return res.status(400).send('Invalid role');
            }

            // Check if user exists
            if (!user) {
                return res.status(404).send('User not found');
            }
    
            // Check if OTP is valid
            const isOTPValid = user.resetOTP.includes(otp);
            if (!isOTPValid) {
                return res.status(400).send('Incorrect or expired OTP');
            }
    
            // Check if passwords match
            if (password !== confirmPassword) {
                return res.status(400).send('Passwords do not match');
            }
    
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            console.log('Hashed password:', hashedPassword);
    
            // Update the password in the database based on role
            let updateQuery;
            if (role === 'student') {
                updateQuery = { email: decodedEmail };
            } else if (role === 'admin') {
                updateQuery = { email: decodedEmail };
            }
            const updateResult = await (role === 'student' ? collection_student : collection_admin).updateOne(updateQuery, { $set: { password: hashedPassword } });
            console.log('Update result:', updateResult);

            // Filter out the used OTP from the array and update the user document
            const updatedOTPArray = user.resetOTP.filter((otpValue) => otpValue !== otp);
            await collection_student.updateOne({ email: decodedEmail }, { $set: { resetOTP: updatedOTPArray } });
    
            // Clear the token cookie and send success message
            res.clearCookie('Token');
            // res.send('Password updated successfully');
            res.redirect("/");
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    });
});

//ADMIN CAN DELETE ISSUE WHICH IS CREATED BY STUDENT 
app.post('/delete-issue/:id', async (req, res) => {
    try {
      const deletedIssue = await issueForm.findByIdAndDelete(req.params.id);
      if (!deletedIssue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
  
      // Redirect back to the view-issues page after deletion
      res.redirect('/student-Issues');
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


//APP LISTENER
app.listen(port, () => {
    console.log(`Server is running at ${port}`);
});