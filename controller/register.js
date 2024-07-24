const { connection } = require('../utils/connection');
const crypto = require('crypto');
const nodemailer=require('nodemailer')

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
    }
});


function generateRandomString(length) {
    return crypto.randomBytes(length).toString('hex');
}
async function Register(req, resp) {
    const { name, email, password } = req.body;
    const image = req.file.filename;

    connection.query(`SELECT * FROM users WHERE email='${email}'`, (err, res) => {
        if (err) throw err;
        if (res.length > 0) {
            resp.status(200).json({ message: 'Email already registered' });
        } else {
            const HashedPassword = crypto.createHash('sha256').update(password).digest('hex');
            const verificationToken = generateRandomString(16);

            const data = {
                image: image,
                level: 1,
                badge: 'silver',
                name: name,
                email: email,
                password: HashedPassword,
                isVerified: false, // Default to false
                verificationToken: verificationToken // Store the verification token
            };

            connection.query('INSERT INTO users SET ?', data, (err, res) => {
                if (err) throw err;

                // Send verification email
                const verificationLink = `http://localhost:5002/api/v1/register/verify-email?token=${verificationToken}`;
                const mailOptions = {
                    from: 'faizanazam6980@gmail.com',
                    to: email,
                    subject: 'Email Verification',
                    html: `
                    <p>Thank you for registering with us!</p>
                    <p>To complete your registration, please verify your email by clicking the button below:</p>
                    <a href="${verificationLink}" style="
                        display: inline-block;
                        padding: 10px 20px;
                        font-size: 16px;
                        font-family: Arial, sans-serif;
                        color: #ffffff;
                        background-color: #007bff;
                        text-decoration: none;
                        border-radius: 5px;
                        text-align: center;
                        margin-top: 20px;
                        border: 1px solid #007bff;
                        transition: background-color 0.3s, border-color 0.3s;
                    " onmouseover="this.style.backgroundColor='#0056b3';this.style.borderColor='#0056b3';" onmouseout="this.style.backgroundColor='#007bff';this.style.borderColor='#007bff';">
                        Verify Your Email
                    </a>
                    <p>If you did not create an account, please ignore this email.</p>
                    <p>Best regards,<br>EmotiTask</p>
                `                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error sending email:', error);
                        resp.status(500).json({ message: 'Registration successful but failed to send verification email' });
                    } else {
                        resp.status(200).json({ message: 'Registration successful. Please check your email to verify your account.' });
                    }
                });
            });
        }
    });
}



 async function verifyemail (req, resp) {
    const { token } = req.query;

    if (!token) {
        return resp.status(400).json({ error: 'Verification token is required' });
    }

    connection.query('SELECT * FROM users WHERE verificationToken = ?', [token], (err, res) => {
        if (err) throw err;

        if (res.length === 0) {
            return resp.status(400).json({ error: 'Invalid or expired token' });
        }

        const user = res[0];

        if (user.isVerified) {
            return resp.status(200).json({ message: 'Email already verified' });
        }

        connection.query('UPDATE users SET isVerified = true, verificationToken = NULL WHERE id = ?', [user.id], (err) => {
            if (err) throw err;


            resp.redirect('http://localhost:5173/login')

        });
    });
}

module.exports = {
    Register,verifyemail
};
