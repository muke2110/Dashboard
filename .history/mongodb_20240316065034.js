app.post('/verifyAndResetPassword', async (req, res) => {
    const { otp, password, confirmPassword } = req.body;
    const token = req.cookies['Token'];

    if (token) {
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                return res.status(401).send('Invalid token');
            }
            
            const decodedEmail = decoded.email;
            const role = decoded.role;

            try {
                let user;
                if (role === 'student') {
                    user = await collection_student.findOne({ "email": decodedEmail });
                } else if (role === 'admin') {
                    user = await collection_admin.findOne({ "email": decodedEmail });
                } else {
                    return res.status(400).send('Invalid role');
                }
        
                if (!user) {
                    return res.status(404).send('User not found');
                }
        
                const isOTPValid = user.resetOTP.includes(otp);
                if (!isOTPValid) {
                    return res.status(400).send('Incorrect or expired OTP');
                }
        
                if (password !== confirmPassword) {
                    return res.status(400).send('Passwords do not match');
                }
        
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
        
                let updateQuery;
                if (role === 'student') {
                    updateQuery = { email: decodedEmail };
                    await collection_student.updateOne(updateQuery, { $set: { password: hashedPassword } });
                } else if (role === 'admin') {
                    updateQuery = { email: decodedEmail };
                    await collection_admin.updateOne(updateQuery, { $set: { password: hashedPassword } });
                }
        
                const updatedUser = await collection_student.findOne({ email: decodedEmail });
        
                const updatedOTPArray = user.resetOTP.filter((otpValue) => otpValue !== otp);
                await collection_student.updateOne({ email: decodedEmail }, { $set: { resetOTP: updatedOTPArray } });
        
                res.clearCookie('Token');
                res.send('Password updated successfully');
            } catch (error) {
                console.error(error);
                res.status(500).send('Server Error');
            }
        });
    } else {
        return res.status(401).send('Token not provided');
    }
});