const express = require('express');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Backend running' }));

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields (name, email, message)' });
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const owner = process.env.OWNER_EMAIL || user;

  if (!user || !pass) {
    console.error('EMAIL_USER or EMAIL_PASS not set in env');
    return res.status(500).json({ error: 'Email credentials not configured' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    // Verify transporter connectivity/auth before sending
    try {
      await transporter.verify();
      console.log('✅ Mail transporter verified');
    } catch (verifyErr) {
      console.error('Mail transporter verification failed:', verifyErr);
      return res.status(500).json({ error: 'Mail transporter verification failed', detail: verifyErr && verifyErr.message });
    }

    // 🎨 Enhanced Owner Notification Email
    const ownerMail = {
      from: user,
      to: owner,
      subject: `📧 New Contact Form Submission from ${name}`,
      text: `New message from ${name} <${email}>:\n\n${message}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
        * { 
            font-family: 'Inter', 'Poppins', Arial, sans-serif; 
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container { 
            max-width: 650px; 
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }
        .header { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            text-align: center; 
            color: white; 
            padding: 45px 40px;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="%23ffffff" opacity="0.1"><polygon points="1000,100 1000,0 0,100"/></svg>');
            background-size: cover;
        }
        .header h1 { 
            margin: 0 0 15px 0; 
            font-size: 2.2rem; 
            font-weight: 600;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 2;
        }
        .header p {
            font-size: 1.1rem;
            opacity: 0.95;
            font-weight: 400;
            position: relative;
            z-index: 2;
        }
        .emoji-badge {
            font-size: 2.5rem;
            margin-bottom: 15px;
            display: block;
            position: relative;
            z-index: 2;
        }
        .content { 
            padding: 40px 35px; 
        }
        .section-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .section-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, #4f46e5, transparent);
        }
        .user-info { 
            background: #f8fafc;
            padding: 25px; 
            border-radius: 12px; 
            margin: 25px 0; 
            border-left: 4px solid #4f46e5;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .info-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .info-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 1.1rem;
            color: white;
        }
        .info-content {
            flex: 1;
        }
        .info-label {
            font-weight: 600;
            color: #64748b;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .info-value {
            font-weight: 500;
            color: #1e293b;
            font-size: 1rem;
        }
        .message-box { 
            background: #fefce8;
            padding: 30px; 
            border-radius: 12px; 
            margin: 25px 0;
            border: 1px solid #fef08a;
            position: relative;
        }
        .message-box::before {
            content: '"';
            position: absolute;
            top: 15px;
            left: 20px;
            font-size: 3rem;
            color: #eab308;
            font-family: serif;
            line-height: 1;
        }
        .message-content {
            font-style: italic;
            color: #422006;
            line-height: 1.6;
            font-size: 1rem;
            margin-left: 15px;
        }
        .action-box {
            background: #f0f9ff;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            border: 1px solid #7dd3fc;
            text-align: center;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 12px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            margin-top: 12px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
        .action-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        }
        .footer { 
            text-align: center; 
            color: #64748b; 
            font-size: 0.85rem; 
            margin-top: 40px;
            padding-top: 25px;
            border-top: 1px solid #e2e8f0;
        }
        .highlight { 
            color: #4f46e5;
            font-weight: 600;
        }
        a {
            color: #4f46e5;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji-badge">📧</div>
            <h1>New Contact Message</h1>
            <p>Someone reached out through your website</p>
        </div>
        <div class="content">
            <div class="section-title">
                <span>Contact Details</span>
            </div>
            
            <div class="user-info">
                <div class="info-item">
                    <div class="info-icon">👤</div>
                    <div class="info-content">
                        <div class="info-label">Name</div>
                        <div class="info-value highlight">${name}</div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-icon">📧</div>
                    <div class="info-content">
                        <div class="info-label">Email Address</div>
                        <div class="info-value">
                            <a href="mailto:${email}">${email}</a>
                        </div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-icon">⏰</div>
                    <div class="info-content">
                        <div class="info-label">Submission Time</div>
                        <div class="info-value">${new Date().toLocaleString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</div>
                    </div>
                </div>
            </div>

            <div class="section-title">
                <span>Message Content</span>
            </div>
            <div class="message-box">
                <div class="message-content">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            </div>

            <div class="action-box">
                <h3 style="color: #0369a1; margin-bottom: 12px; font-size: 1.1rem;">Quick Action Required</h3>
                <p style="color: #0369a1; margin-bottom: 15px; line-height: 1.5;">
                    Click below to reply directly to ${name} and start the conversation!
                </p>
                <a href="mailto:${email}?subject=Re: Your website inquiry&body=Hi ${name}," class="action-button">
                    Reply to ${name}
                </a>
            </div>

            <div class="footer">
                <p>Automated Notification System • This email was sent from your website contact form</p>
                <p style="margin-top: 8px; font-size: 0.8rem; color: #94a3b8;">
                    Powered by your contact form backend • ${new Date().getFullYear()}
                </p>
            </div>
        </div>
    </div>
</body>
</html>
      `,
    };

    // 🎨 Enhanced Acknowledgement Email with Social Icons
    const ackMail = {
      from: user,
      to: email,
      subject: `Thank You ${name}! Your Message Has Been Received`,
      text: `Hi ${name},\n\nThanks for contacting me. I received your message:\n\n"${message}"\n\nI'll get back to you as soon as possible.\n\nConnect with me:\nLinkedIn: https://www.linkedin.com/in/dhineshkumar45\nInstagram: https://www.instagram.com/_ms_dhinesh_/\nPortfolio: https://portfolio-dhinesh.me/`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
        * { 
            font-family: 'Inter', 'Poppins', Arial, sans-serif; 
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container { 
            max-width: 650px; 
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
        }
        .header { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            text-align: center; 
            color: white; 
            padding: 50px 40px;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="%23ffffff" opacity="0.1"><circle cx="200" cy="50" r="30"/><circle cx="600" cy="30" r="20"/><circle cx="800" cy="70" r="25"/></svg>');
            background-size: cover;
        }
        .header h1 { 
            margin: 0 0 15px 0; 
            font-size: 2.3rem; 
            font-weight: 600;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 2;
        }
        .header p {
            font-size: 1.15rem;
            opacity: 0.95;
            font-weight: 400;
            position: relative;
            z-index: 2;
            line-height: 1.4;
        }
        .emoji-badge {
            font-size: 3rem;
            margin-bottom: 20px;
            display: block;
            position: relative;
            z-index: 2;
        }
        .content { 
            padding: 40px 35px; 
        }
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        .welcome-text {
            font-size: 1.1rem;
            color: #475569;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .highlight-name {
            color: #4f46e5;
            font-weight: 600;
            font-size: 1.2rem;
        }
        .message-preview { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 30px; 
            border-radius: 12px; 
            margin: 30px 0; 
            position: relative;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
        }
        .message-preview::before {
            content: '"';
            position: absolute;
            top: 15px;
            left: 20px;
            font-size: 3.5rem;
            color: rgba(255,255,255,0.3);
            font-family: serif;
            line-height: 1;
        }
        .message-content {
            font-style: italic;
            line-height: 1.6;
            font-size: 1.05rem;
            margin-left: 15px;
            position: relative;
            z-index: 2;
        }
        .info-card {
            background: #f8fafc;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            border-left: 4px solid;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .card-next-steps {
            border-left-color: #10b981;
        }
        .card-contact {
            border-left-color: #3b82f6;
        }
        .card-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #1e293b;
        }
        .card-list {
            list-style: none;
            padding: 0;
        }
        .card-list li {
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #475569;
            font-size: 0.95rem;
        }
        .card-list li:last-child {
            border-bottom: none;
        }
        .card-list li::before {
            content: '✓';
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .social-links { 
            margin: 30px 0; 
            text-align: center;
        }
        .social-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .social-buttons {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        .social-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: white;
            color: #475569;
            padding: 12px 20px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
        }
        .social-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        .social-button.linkedin {
            background: #0077b5;
            color: white;
            border-color: #0077b5;
        }
        .social-button.instagram {
            background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45, #FFDC80);
            color: white;
            border: none;
        }
        .social-button.portfolio {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            border: none;
        }
        .social-icon {
            font-size: 1.1rem;
        }
        .footer { 
            text-align: center; 
            color: #64748b; 
            font-size: 0.85rem; 
            margin-top: 40px;
            padding-top: 25px;
            border-top: 1px solid #e2e8f0;
        }
        .assurance {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            text-align: center;
            border: 1px solid #bbf7d0;
        }
        .assurance-text {
            color: #166534;
            font-weight: 500;
            font-size: 1rem;
            margin: 0;
        }
        .status-badge {
            text-align: center;
            margin: 25px 0;
        }
        .status-text {
            font-size: 1.3rem;
            font-weight: 600;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji-badge">✅</div>
            <h1>Thank You ${name}!</h1>
            <p>Your message has been received successfully</p>
        </div>
        <div class="content">
            <div class="welcome-section">
                <p class="welcome-text">
                    Hello <span class="highlight-name">${name}</span>,
                </p>
                <p class="welcome-text">
                    Thank you for reaching out! I appreciate you taking the time to get in touch and will respond to your message as soon as possible.
                </p>
            </div>

            <div class="message-preview">
                <div class="message-content">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            </div>

            <div class="info-card card-next-steps">
                <div class="card-title">
                    <span>What Happens Next?</span>
                </div>
                <ul class="card-list">
                    <li>I've received your message and will review it carefully</li>
                    <li>I'll address all your questions and concerns</li>
                    <li>You can expect a reply within 24-48 hours</li>
                    <li>I'll provide any additional information you might need</li>
                </ul>
            </div>

            <div class="assurance">
                <p class="assurance-text">
                    Your message is safe with me. I respect your privacy and will handle your information with care.
                </p>
            </div>

            <div class="info-card card-contact">
                <div class="card-title">
                    <span>Stay Connected</span>
                </div>
                <ul class="card-list">
                    <li>Feel free to reach out for any urgent inquiries</li>
                    <li>You can add additional information by replying to this email</li>
                    <li>Follow my social channels for updates and insights</li>
                </ul>
            </div>

            <div class="social-links">
                <div class="social-title">Connect With Me</div>
                <div class="social-buttons">
                    <a href="https://www.linkedin.com/in/dhineshkumar45" class="social-button linkedin">
                        <span class="social-icon">💼</span>
                        LinkedIn
                    </a>
                    <a href="https://www.instagram.com/_ms_dhinesh_/" class="social-button instagram">
                        <span class="social-icon">📷</span>
                        Instagram
                    </a>
                    <a href="https://portfolio-dhinesh.me/" class="social-button portfolio">
                        <span class="social-icon">🌐</span>
                        Portfolio
                    </a>
                </div>
            </div>

            <div class="footer">
                <p>Automated Acknowledgement System • This email confirms I've successfully received your message</p>
                <p style="margin-top: 12px; font-size: 0.8rem; color: #94a3b8; line-height: 1.4;">
                    You're receiving this email because you contacted us through our website contact form.<br>
                    If this wasn't you, please ignore this message or contact us immediately.
                </p>
                <p style="margin-top: 8px; font-size: 0.75rem; color: #cbd5e1;">
                    Powered by your contact form backend • ${new Date().getFullYear()}
                </p>
            </div>
        </div>
    </div>
</body>
</html>
      `,
    };

    // Send notification to owner
    await transporter.sendMail(ownerMail);
    // Send acknowledgement to sender
    await transporter.sendMail(ackMail);

    return res.status(200).json({ message: 'Emails sent successfully! 🎉' });
  } catch (err) {
    console.error('Failed to send emails', err);
    return res.status(500).json({ error: 'Failed to send emails', detail: err && err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
  console.log(`⭐ Contact endpoint: http://localhost:${PORT}/api/contact`);
});