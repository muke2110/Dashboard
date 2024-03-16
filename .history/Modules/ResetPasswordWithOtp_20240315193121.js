const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { collection_admin, collection_student } = require('../mongodb');

// Function to send OTP via email
const sendOTP = async (email, otp) => {
    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    // Email message
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}`
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

// Controller for forget password route
exports.forgetPassword = async (req, res) => {
    const { roll_number, email, role } = req.body;

    try {
        let user;
        // Check the role selected by the user
        if (role === 'student') {
            user = await student(roll_number, res);
        } else if (role === 'admin') {
            user = await adminInfo(roll_number, res);
        } else {
            return res.status(400).send('Invalid role');
        }

        if (!user) {
            return res.status(400).send('User not found');
        }

        // Generate OTP (you can use any library for this)
        const otp = generateOTP();

        // Save OTP to the user document in database
        user.resetOTP = otp;
        await user.save();

        // Send OTP via email
        await sendOTP(email, otp);

        // Redirect to verification page
        res.redirect('/verificationPage');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Controller for handling verification and password update
exports.verifyAndResetPassword = async (req, res) => {
    const { email, otp, password, confirmPassword } = req.body;

    try {
        let user;
        // Check the role of the user
        if (user.role === 'student') {
            user = await collection_student.findOne({ email });
        } else if (user.role === 'admin') {
            user = await collection_admin.findOne({ email });
        } else {
            return res.status(400).send('Invalid role');
        }

        // Verify OTP
        if (user.resetOTP !== otp) {
            return res.status(400).send('Invalid OTP');
        }

        // Verify passwords
        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password in database
        if (user.role === 'student') {
            await collection_student.updateOne({ email }, { $set: { password: hashedPassword, resetOTP: null } });
        } else if (user.role === 'admin') {
            await collection_admin.updateOne({ email }, { $set: { password: hashedPassword, resetOTP: null } });
        }

        // Password updated successfully
        res.send('Password updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
