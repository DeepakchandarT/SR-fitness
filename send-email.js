/**
 * Simple Node.js Email Server for SR Gyms Report Delivery
 * Install: npm install express nodemailer cors dotenv body-parser
 * Run: node send-email.js
 */

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Configure your email service (Gmail, SendGrid, etc.)
// For Gmail: Enable "Less secure app access" or use App Passwords
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Endpoint to send report
app.post('/api/send-report', async (req, res) => {
    try {
        const { email, name, reportData, pdfBase64 } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name required' });
        }

        // Create email content
        const emailContent = `
            <h2>Your SR Gyms AI Fitness Report</h2>
            <p>Hi ${name},</p>
            <p>Your personalized fitness analysis report has been generated. Please find the detailed PDF report attached.</p>
            
            <h3>Quick Summary:</h3>
            <ul>
                <li><strong>Fitness Score:</strong> ${reportData.fitnessScore}/100</li>
                <li><strong>BMI:</strong> ${reportData.bmi} (${reportData.bmiStatus})</li>
                <li><strong>BMR:</strong> ${reportData.bmr} kcal/day</li>
                <li><strong>TDEE:</strong> ${reportData.tdee} kcal/day</li>
                <li><strong>Posture Score:</strong> ${reportData.postureScore}/100</li>
                <li><strong>Symmetry Index:</strong> ${reportData.symmetryScore}%</li>
            </ul>
            
            <p>Visit our gym to discuss your personalized training plan with our coaching staff.</p>
            <p>Best regards,<br>SR Gyms Team</p>
        `;

        // Convert base64 PDF to buffer
        const pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@srgyms.com',
            to: email,
            subject: `SR Gyms - Fitness Analysis Report for ${name}`,
            html: emailContent,
            attachments: [
                {
                    filename: `SR_Gyms_Report_${name.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true, 
            message: `Report sent successfully to ${email}` 
        });

    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ 
            error: 'Failed to send email',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Email server running on http://localhost:${PORT}`);
    console.log(`📧 Configure email credentials in .env file`);
});
