# SR Gyms Report Email Delivery - Setup Guide

## 📧 Email Sending Implementation (3 Options)

Your AI fitness scan now generates reports with **all 35+ data values**. Here's how to enable automatic PDF email delivery:

---

## Option 1: **FREE - Using Formspree (Easiest, No Backend Needed)**

### Setup (5 minutes):
1. Go to https://formspree.io
2. Create a free account
3. Create a new form and get your **Form ID**
4. Add this to your `ragav_v1_pro.html` in the `sendReportEmail` function:

```javascript
async function sendReportEmail(reportData, email, name) {
    if (!email) return;
    
    try {
        const element = document.getElementById('report-output');
        const opt = {
            margin: 0.5,
            filename: `SR_Gyms_Report_${name.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'in', format: 'letter' }
        };
        
        // Generate PDF
        const pdf = await html2pdf().set(opt).from(element).outputPdf('blob');
        
        // Send via Formspree
        const formData = new FormData();
        formData.append('email', email);
        formData.append('name', name);
        formData.append('fitness_score', reportData.fitnessScore);
        
        await fetch('https://formspree.io/f/YOUR_FORM_ID', {
            method: 'POST',
            body: formData
        });
        
        showEmailSuccess(email);
    } catch(error) {
        console.error('Error:', error);
        showEmailWarning();
    }
}
```

---

## Option 2: **Node.js Backend (Most Flexible)**

### Setup (10 minutes):

1. **Install Node.js** from https://nodejs.org

2. **In your `ragavpro` folder, create:**
   - `send-email.js` (provided in repo)
   - `package.json` (provided in repo)
   - `.env` file with:
     ```
     EMAIL_USER=your-gmail@gmail.com
     EMAIL_PASS=your-app-password
     PORT=3000
     ```

3. **Get Gmail App Password:**
   - Enable 2FA: https://myaccount.google.com/security
   - Go to: https://myaccount.google.com/apppasswords
   - Select Mail + Windows Computer
   - Copy the 16-char password to `.env`

4. **Install & Run:**
   ```bash
   npm install
   npm start
   ```

5. **Update `sendReportEmail` in HTML:**
```javascript
async function sendReportEmail(reportData, email, name) {
    if (!email) return;
    
    try {
        const element = document.getElementById('report-output');
        const opt = {
            margin: 0.5,
            filename: `SR_Gyms_Report_${name.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'in', format: 'letter' }
        };
        
        const pdf = await html2pdf().set(opt).from(element).outputPdf('datauri');
        
        // Send to your backend
        const response = await fetch('http://localhost:3000/api/send-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                name: name,
                reportData: reportData,
                pdfBase64: pdf
            })
        });
        
        const result = await response.json();
        if (result.success) {
            showEmailSuccess(email);
        } else {
            showEmailWarning();
        }
    } catch(error) {
        console.error('Error:', error);
        showEmailWarning();
    }
}
```

---

## Option 3: **SendGrid (Professional, Free Tier)**

1. Create account: https://sendgrid.com
2. Create API key
3. Use Formspree or a simple backend service

---

## 📊 Report Data Included (35+ Values)

The PDF report now includes all:
- **Health Metrics:** BMI, BMR, TDEE, Protein Target, Water Intake, Frame Size
- **Personal Data:** Name, Age, Gender, Height, Weight, BMI Status
- **Posture Analysis:** Posture Score, Symmetry Index, Shoulder Alignment, Hip Width
- **AI Metrics:** Shoulder Width, Spine Alignment, Body Type, Fitness Score
- **Recommendations:** Workout strategy, caloric targets, nutrition plan

---

## 🧪 Test Email Delivery

1. Fill in the scan form with your email
2. Upload a photo and click "START SCANNING"
3. After report generates, check your email
4. Report PDF should arrive within 1-2 minutes

---

## 🐛 Troubleshooting

**"Report generated but email not sent"**
- Backend not running (Option 2) - run `npm start`
- Gmail: Use app-specific password, not your regular password
- Check spam/junk folder

**"CORS Error"**
- Make sure backend CORS is enabled
- Using Formspree? No CORS issues needed

**PDF not generating?**
- Enable developer console (F12) and check for errors
- Ensure all form fields are filled

---

## 📱 For Production

- Use a service like Heroku, Railway, or Vercel for hosting the backend
- Use SendGrid or Mailgun for higher email volume
- Add email templates for professional branding

---

Need help? The HTML file now has the framework - just implement one of the email options above!
