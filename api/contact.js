// api/contact.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, message } = req.body;

        // Validate
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Configure email transporter
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Portfolio Contact: ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Message: ${message}
            `,
            html: `
                <h3>New Contact Form Message</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({ error: 'Failed to send message' });
    }
}