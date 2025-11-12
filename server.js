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

    // 🎨 Enhanced Owner Notification Email
    const ownerMail = {
      from: user,
      to: owner,
      subject: `🎯 New Contact Form Submission from ${name}`,
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container { 
            max-width: 650px; 
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="%23ffffff" opacity="0.1"><polygon points="1000,100 1000,0 0,100"/></svg>');
            background-size: cover;
        }
        .header h1 { 
            margin: 0 0 15px 0; 
            font-size: 2.5rem; 
            font-weight: 700;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 2;
        }
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
            font-weight: 400;
            position: relative;
            z-index: 2;
        }
        .emoji-badge {
            font-size: 3rem;
            margin-bottom: 20px;
            display: block;
            position: relative;
            z-index: 2;
        }
        .content { 
            padding: 50px 40px; 
        }
        .section-title {
            font-size: 1.4rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .section-title::after {
            content: '';
            flex: 1;
            height: 2px;
            background: linear-gradient(90deg, #667eea, transparent);
        }
        .user-info { 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 30px; 
            border-radius: 15px; 
            margin: 30px 0; 
            border-left: 5px solid #667eea;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .info-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .info-icon {
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            font-size: 1.2rem;
            color: white;
        }
        .info-content {
            flex: 1;
        }
        .info-label {
            font-weight: 600;
            color: #4a5568;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .info-value {
            font-weight: 500;
            color: #2d3748;
            font-size: 1.1rem;
        }
        .message-box { 
            background: linear-gradient(135deg, #fff9db 0%, #ffeaa7 100%);
            padding: 35px; 
            border-radius: 15px; 
            margin: 30px 0;
            border: 2px dashed #fdcb6e;
            position: relative;
        }
        .message-box::before {
            content: '"';
            position: absolute;
            top: 15px;
            left: 20px;
            font-size: 4rem;
            color: #fdcb6e;
            font-family: serif;
            line-height: 1;
        }
        .message-content {
            font-style: italic;
            color: #2d3436;
            line-height: 1.7;
            font-size: 1.1rem;
            margin-left: 20px;
        }
        .action-box {
            background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px solid #17a2b8;
            text-align: center;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 35px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            margin-top: 15px;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }
        .footer { 
            text-align: center; 
            color: #718096; 
            font-size: 0.9rem; 
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
        }
        .highlight { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji-badge">🎉</div>
            <h1>New Contact Message! 🚀</h1>
            <p>Someone reached out through your website</p>
        </div>
        <div class="content">
            <div class="section-title">
                <span>✨ Contact Details</span>
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
                            <a href="mailto:${email}" style="color: #667eea; text-decoration: none; font-weight: 500;">${email}</a>
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
                <span>💬 Message Content</span>
            </div>
            <div class="message-box">
                <div class="message-content">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            </div>

            <div class="action-box">
                <h3 style="color: #0c5460; margin-bottom: 15px; font-size: 1.2rem;">💡 Quick Action Required</h3>
                <p style="color: #0c5460; margin-bottom: 20px; line-height: 1.6;">
                    Click below to reply directly to ${name} and start the conversation!
                </p>
                <a href="mailto:${email}?subject=Re: Your website inquiry&body=Hi ${name}," class="action-button">
                    ✨ Reply to ${name}
                </a>
            </div>

            <div class="footer">
                <p>🎯 <strong>Automated Notification System</strong> • This email was sent from your website contact form</p>
                <p style="margin-top: 10px; font-size: 0.8rem; color: #a0aec0;">
                    Powered by your contact form backend • ${new Date().getFullYear()}
                </p>
            </div>
        </div>
    </div>
</body>
</html>
      `,
    };

    // 🎨 Enhanced Acknowledgement Email
    const ackMail = {
      from: user,
      to: email,
      subject: `✨ Thank You ${name}! Your Message Has Been Received`,
      text: `Hi ${name},\n\nThanks for contacting me. I received your message:\n\n"${message}"\n\nI'll get back to you as soon as possible.`,
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container { 
            max-width: 650px; 
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            text-align: center; 
            color: white; 
            padding: 60px 40px;
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
            margin: 0 0 20px 0; 
            font-size: 2.8rem; 
            font-weight: 700;
            letter-spacing: -0.5px;
            position: relative;
            z-index: 2;
        }
        .header p {
            font-size: 1.3rem;
            opacity: 0.95;
            font-weight: 400;
            position: relative;
            z-index: 2;
            line-height: 1.5;
        }
        .emoji-badge {
            font-size: 4rem;
            margin-bottom: 25px;
            display: block;
            position: relative;
            z-index: 2;
            animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .content { 
            padding: 50px 40px; 
        }
        .welcome-section {
            text-align: center;
            margin-bottom: 40px;
        }
        .welcome-text {
            font-size: 1.3rem;
            color: #4a5568;
            line-height: 1.7;
            margin-bottom: 30px;
        }
        .highlight-name {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
            font-size: 1.4rem;
        }
        .message-preview { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px; 
            border-radius: 20px; 
            margin: 40px 0; 
            position: relative;
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
        }
        .message-preview::before {
            content: '"';
            position: absolute;
            top: 20px;
            left: 30px;
            font-size: 5rem;
            color: rgba(255,255,255,0.3);
            font-family: serif;
            line-height: 1;
        }
        .message-content {
            font-style: italic;
            line-height: 1.8;
            font-size: 1.2rem;
            margin-left: 20px;
            position: relative;
            z-index: 2;
        }
        .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 35px;
            border-radius: 18px;
            margin: 30px 0;
            border-left: 5px solid;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        }
        .card-next-steps {
            border-left-color: #48bb78;
        }
        .card-contact {
            border-left-color: #4299e1;
        }
        .card-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .card-list {
            list-style: none;
            padding: 0;
        }
        .card-list li {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #4a5568;
            font-size: 1.05rem;
        }
        .card-list li:last-child {
            border-bottom: none;
        }
        .card-list li::before {
            content: '✓';
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            font-weight: bold;
        }
        .social-links { 
            margin: 40px 0; 
            text-align: center;
        }
        .social-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 25px;
        }
        .social-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        .social-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 25px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        .social-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5);
        }
        .footer { 
            text-align: center; 
            color: #718096; 
            font-size: 0.9rem; 
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
        }
        .assurance {
            background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
            padding: 25px;
            border-radius: 15px;
            margin: 30px 0;
            text-align: center;
            border: 2px solid #48bb78;
        }
        .assurance-text {
            color: #22543d;
            font-weight: 500;
            font-size: 1.1rem;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji-badge">🎯</div>
            <h1>Thank You ${name}! ✨</h1>
            <p>Your message has been received successfully</p>
        </div>
        <div class="content">
            <div class="welcome-section">
                <p class="welcome-text">
                    Hello <span class="highlight-name">${name}</span>,
                </p>
                <p class="welcome-text">
                    Thank you for reaching out! I'm absolutely thrilled to connect with you and truly appreciate you taking the time to get in touch. 🤗
                </p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <div style="font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    Your Message is Securely Delivered! 💫
                </div>
            </div>

            <div class="message-preview">
                <div class="message-content">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            </div>

            <div class="info-card card-next-steps">
                <div class="card-title">
                    <span>📅 What Happens Next?</span>
                </div>
                <ul class="card-list">
                    <li>I've personally received your message and will review it carefully</li>
                    <li>I'll address all your questions and concerns with detailed responses</li>
                    <li>You can expect a reply within 24-48 hours during business days</li>
                    <li>I'll provide any additional information or clarification you might need</li>
                </ul>
            </div>

            <div class="assurance">
                <p class="assurance-text">
                    🔒 Your message is safe with me. I respect your privacy and will handle your information with care.
                </p>
            </div>

            <div class="info-card card-contact">
                <div class="card-title">
                    <span>📞 Stay Connected</span>
                </div>
                <ul class="card-list">
                    <li>Feel free to reach out for any urgent inquiries</li>
                    <li>You can add any additional information by replying to this email</li>
                    <li>Follow my social channels for updates and insights</li>
                </ul>
            </div>

            <div class="social-links">
                <div class="social-title">🔗 Connect With Me</div>
                <div class="social-buttons">
                    <a href="https://www.linkedin.com/in/dhineshkumar45" class="social-button">
                        <span>📘</span> LinkedIn
                    </a>
                    <a href="https://www.instagram.com/_ms_dhinesh_/" class="social-button">
                        <span>📷</span> Instagram
                    </a>
                    <a href="https://portfolio-dhinesh.me/" class="social-button">
                        <span>💼</span> Portfolio
                    </a>
                </div>
            </div>

            <div class="footer">
                <p>⭐ <strong>Automated Acknowledgement System</strong> • This email confirms I've successfully received your message</p>
                <p style="margin-top: 15px; font-size: 0.85rem; color: #a0aec0; line-height: 1.5;">
                    You're receiving this email because you contacted us through our website contact form.<br>
                    If this wasn't you, please ignore this message or contact us immediately.
                </p>
                <p style="margin-top: 10px; font-size: 0.8rem; color: #cbd5e0;">
                    Powered by your contact form backend • ${new Date().getFullYear()} • Made with ❤️
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
    return res.status(500).json({ error: 'Failed to send emails ❌' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
  console.log(`⭐ Contact endpoint: http://localhost:${PORT}/api/contact`);
});