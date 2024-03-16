const nodemailer = require('nodemailer');
const multer = require('multer');

async function sendEmailWithAttachment(email, pdfPath, name, eventName) {
    const transporter = nodemailer.createTransport({
        // Provide your email service credentials here
        service: 'Gmail',
        auth: {
            user: 'noreply.test2110@gmail.com', // Update with your Gmail email address
            pass: 'doeoerkmnxyrdrlq' // Update with your Gmail password
        }
    });

    const mailOptions = {
        from: 'noreply.test2110@gmail.com', // Update with your Gmail email address
        to: email,
        subject: 'Certificate',
        text: `Dear ${name},\n\nPlease find attached your certificate for the event ${eventName}.\n\nBest regards,\nYour Organization`,
        attachments: [
            {
                filename: `certificate_${name}.pdf`, // Update filename as needed
                path: pdfPath
            }
        ]
    };

    await transporter.sendMail(mailOptions);
}


//For OTP purpose

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


module.exports = { sendEmailWithAttachment };