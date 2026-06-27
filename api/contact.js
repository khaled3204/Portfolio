// api/contact.js
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Enable CORS for local development
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'All fields (name, email, message) are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Validate message length
        if (message.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Message must be at least 10 characters long'
            });
        }

        // Check if environment variables are set
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Missing email environment variables');
            return res.status(500).json({
                success: false,
                error: 'Email service not configured properly'
            });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // Add timeout and connection settings
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000
        });

        // Verify connection
        await transporter.verify();

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `📩 New Portfolio Message from ${name}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #9B8DFF, #7C6EE4); padding: 20px; border-radius: 10px 10px 0 0; }
                        .header h2 { color: white; margin: 0; }
                        .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 10px 10px; }
                        .field { margin-bottom: 20px; }
                        .label { font-weight: bold; color: #333; display: block; margin-bottom: 5px; }
                        .value { background: white; padding: 10px; border-radius: 5px; border-left: 4px solid #9B8DFF; }
                        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>📧 New Contact Form Submission</h2>
                    </div>
                    <div class="content">
                        <div class="field">
                            <span class="label">👤 Name</span>
                            <div class="value">${name}</div>
                        </div>
                        <div class="field">
                            <span class="label">📧 Email</span>
                            <div class="value"><a href="mailto:${email}">${email}</a></div>
                        </div>
                        <div class="field">
                            <span class="label">💬 Message</span>
                            <div class="value">${message.replace(/\n/g, '<br>')}</div>
                        </div>
                        <div class="footer">
                            <p>This message was sent from your portfolio website.</p>
                            <p><small>You can reply directly to this email to contact ${name}.</small></p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            replyTo: email,
            text: `
                New Contact Form Submission
                
                Name: ${name}
                Email: ${email}
                Message: ${message}
                
                This message was sent from your portfolio website.
            `
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully!',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Error sending email:', error);

        // Provide more specific error messages
        let errorMessage = 'Failed to send email';
        if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Please check your credentials.';
        } else if (error.code === 'ECONNECTION') {
            errorMessage = 'Could not connect to email service. Please try again later.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return res.status(500).json({
            success: false,
            error: errorMessage,
            code: error.code
        });
    }
};