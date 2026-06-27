const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    console.log('=== CONTACT API STARTED ===');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight
    if (req.method === 'OPTIONS') {
        console.log('OPTIONS request - returning 200');
        return res.status(200).end();
    }

    // Only POST
    if (req.method !== 'POST') {
        console.log('Not POST - returning 405');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Parsing request body...');
        const { name, email, message } = req.body;
        console.log('Parsed data:', { name, email, message });

        // Validate
        if (!name || !email || !message) {
            console.log('Validation failed - missing fields');
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Validation failed - invalid email');
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Check environment variables
        console.log('Checking environment variables...');
        console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
        console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Missing env vars');
            return res.status(500).json({
                success: false,
                error: 'Email service not configured. Missing EMAIL_USER or EMAIL_PASS'
            });
        }

        // Create transporter
        console.log('Creating transporter...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify connection
        console.log('Verifying transporter...');
        try {
            await transporter.verify();
            console.log('Transporter verified successfully');
        } catch (verifyError) {
            console.error('Transporter verification FAILED:', verifyError.message);
            return res.status(500).json({
                success: false,
                error: 'Email authentication failed: ' + verifyError.message
            });
        }

        // Send email
        console.log('Preparing email...');
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Portfolio Message from ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <hr>
                <p>Reply to: <a href="mailto:${email}">${email}</a></p>
            `,
            replyTo: email,
            text: `
                New Contact Form Submission
                
                Name: ${name}
                Email: ${email}
                Message: ${message}
                
                Reply to: ${email}
            `
        };

        console.log('Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully!',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('=== ERROR IN CONTACT API ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);

        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to send email',
            code: error.code || 'UNKNOWN_ERROR'
        });
    }
};