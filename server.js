const express = require('express');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://*"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));

app.use(morgan('dev'));
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Backend running' }));

// 🎨 Preview Endpoint for Email Design
app.get('/api/preview-email', (req, res) => {
  const name = "John Doe";
  const email = "john@example.com";
  const message = "Hi Dhinesh! I am highly impressed by your portfolio's performance. Your HUD design is exceptional. Let's build something futuristic!";
  
  const type = req.query.type || 'owner';
  
  const html = type === 'owner' ? getOwnerTemplate(name, email, message) : getAckTemplate(name, email, message);
  res.send(html);
});

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

    const ownerMail = {
      from: user,
      to: owner,
      subject: `📡 SIGNAL DETECTED: ${name}`,
      text: `New message from ${name} <${email}>:\n\n${message}`,
      html: getOwnerTemplate(name, email, message),
    };

    const ackMail = {
      from: user,
      to: email,
      subject: `✅ TRANSMISSION LOGGED: Hi ${name}`,
      text: `Hi ${name},\n\nYour message has been received.`,
      html: getAckTemplate(name, email, message),
    };

    await transporter.sendMail(ownerMail);
    await transporter.sendMail(ackMail);

    return res.status(200).json({ message: 'Emails sent successfully! 🎉' });
  } catch (err) {
    console.error('Failed to send emails', err);
    return res.status(500).json({ error: 'Failed to send emails', detail: err && err.message });
  }
});

// 🎨 Helper: THE DEEP TECH VAULT - Owner Template
function getOwnerTemplate(name, email, message) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background-color: #020617; padding: 40px 10px; font-family: 'Plus Jakarta Sans', sans-serif; color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 32px; border: 1px solid rgba(34, 211, 238, 0.1); overflow: hidden; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5); position: relative; }
        .hud-corner { position: absolute; width: 20px; height: 20px; border-color: #22d3ee; border-style: solid; opacity: 0.5; }
        .top-left { top: 20px; left: 20px; border-width: 2px 0 0 2px; }
        .top-right { top: 20px; right: 20px; border-width: 2px 2px 0 0; }
        .bottom-left { bottom: 20px; left: 20px; border-width: 0 0 2px 2px; }
        .bottom-right { bottom: 20px; right: 20px; border-width: 0 2px 2px 0; }
        .hud-header { padding: 60px 40px; background: radial-gradient(circle at top right, rgba(34, 211, 238, 0.15), transparent); border-bottom: 1px solid rgba(255, 255, 255, 0.05); text-align: center; }
        .system-status { display: inline-flex; align-items: center; gap: 8px; background: rgba(34, 211, 238, 0.05); padding: 4px 12px; border-radius: 20px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #22d3ee; letter-spacing: 0.1em; margin-bottom: 20px; border: 1px solid rgba(34, 211, 238, 0.2); }
        .status-dot { width: 6px; height: 6px; background: #22d3ee; border-radius: 50%; box-shadow: 0 0 8px #22d3ee; }
        .title { font-size: 28px; font-weight: 800; color: #fff; }
        .content { padding: 50px 40px; }
        .data-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; padding: 30px; margin-bottom: 30px; }
        .data-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; }
        .data-value { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 20px; }
        .message-content { font-family: 'JetBrains Mono', monospace; font-size: 14px; line-height: 1.7; color: #cbd5e1; background: rgba(0, 0, 0, 0.2); padding: 25px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.03); }
        .action-container { text-align: center; margin-top: 40px; }
        .primary-btn { display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%); color: #020617 !important; text-decoration: none; padding: 18px 40px; border-radius: 16px; font-weight: 800; font-size: 14px; text-transform: uppercase; box-shadow: 0 10px 20px rgba(34, 211, 238, 0.2); }
        .footer { padding: 40px; background: rgba(0, 0, 0, 0.15); text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.03); font-size: 11px; color: #475569; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hud-corner top-left"></div><div class="hud-corner top-right"></div><div class="hud-corner bottom-left"></div><div class="hud-corner bottom-right"></div>
        <div class="hud-header">
            <div class="system-status"><div class="status-dot"></div>SYSTEM SECURE // SIGNAL 100%</div>
            <h1 class="title">New Intel Received</h1>
        </div>
        <div class="content">
            <div class="data-card">
                <p class="data-label">Origin Entity</p><p class="data-value" style="color: #22d3ee;">${name}</p>
                <p class="data-label">Contact Channel</p><p class="data-value"><a href="mailto:${email}" style="color: #fff; text-decoration: none;">${email}</a></p>
            </div>
            <p class="data-label" style="color: #a855f7;">Decrypted Transmission</p>
            <div class="message-content">${message}</div>
            <div class="action-container"><a href="mailto:${email}" class="primary-btn">Begin Response Sequence</a></div>
        </div>
        <div class="footer">DHINESH KUMAR OS v2.4 // PORTFOLIO CORE // ${new Date().getFullYear()}</div>
    </div>
</body>
</html>`;
}

// 🎨 Helper: THE DEEP TECH VAULT - Acknowledgement Template
function getAckTemplate(name, email, message) {
  // Ultra-vibrant Iconify URLs with forced white for GitHub
  const logos = {
    linkedin: "https://api.iconify.design/logos:linkedin-icon.svg",
    github: "https://api.iconify.design/simple-icons:github.svg?color=%23ffffff",
    instagram: "https://api.iconify.design/skill-icons:instagram.svg",
    portfolio: "https://api.iconify.design/lucide:globe.svg?color=%2322d3ee"
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background-color: #020617; padding: 40px 10px; font-family: 'Plus Jakarta Sans', sans-serif; color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 32px; border: 1px solid rgba(168, 85, 247, 0.1); overflow: hidden; box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5); }
        .header { padding: 70px 40px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .icon-box { width: 80px; height: 80px; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; font-size: 40px; }
        .title { font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 10px; }
        .title span { color: #22d3ee; }
        .subtitle { font-size: 12px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em; }
        .content { padding: 50px 40px; }
        .greeting { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 20px; }
        .greeting span { color: #a855f7; }
        .text { font-size: 16px; color: #94a3b8; line-height: 1.6; margin-bottom: 30px; }
        .preview-label { font-size: 10px; font-weight: 700; color: #22d3ee; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 15px; display: block; }
        .message-preview { background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.03); padding: 25px; border-radius: 20px; font-style: italic; color: #cbd5e1; font-size: 14px; margin-bottom: 40px; border-left: 3px solid #a855f7; }
        .social-title { font-size: 11px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 30px; text-align: center; }
        
        .social-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .social-cell { text-align: center; padding: 10px; width: 25%; }
        .social-link { text-decoration: none; display: block; }
        .social-icon-box { 
            width: 64px; height: 64px; 
            background: rgba(255, 255, 255, 0.03); 
            border: 1px solid rgba(255, 255, 255, 0.1); 
            border-radius: 20px; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            margin: 0 auto 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .social-icon-img { display: block; width: 34px; height: 34px; }
        .social-label { font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .footer { padding: 40px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid rgba(255, 255, 255, 0.03); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon-box">🛡️</div>
            <h1 class="title">Signal <span>Locked.</span></h1>
            <p class="subtitle">CONNECTION ESTABLISHED // SECURE CHANNEL</p>
        </div>
        <div class="content">
            <h2 class="greeting">Hello, <span>${name}</span>!</h2>
            <p class="text">Your transmission has reached my primary terminal. I've successfully logged your message into my response queue.</p>
            <span class="preview-label">Transmission Log:</span>
            <div class="message-preview">"${message}"</div>
            
            <div class="social-title">Active Channels</div>
            <table class="social-table">
                <tr>
                    <td class="social-cell">
                        <a href="https://linkedin.com/in/dhineshkumar45" class="social-link">
                            <div class="social-icon-box">
                                <img src="${logos.linkedin}" class="social-icon-img" alt="">
                            </div>
                            <span class="social-label">LinkedIn</span>
                        </a>
                    </td>
                    <td class="social-cell">
                        <a href="https://github.com/msdhinesh45" class="social-link">
                            <div class="social-icon-box">
                                <img src="${logos.github}" class="social-icon-img" alt="">
                            </div>
                            <span class="social-label">GitHub</span>
                        </a>
                    </td>
                    <td class="social-cell">
                        <a href="https://instagram.com/_ms_dhinesh_" class="social-link">
                            <div class="social-icon-box">
                                <img src="${logos.instagram}" class="social-icon-img" alt="">
                            </div>
                            <span class="social-label">Instagram</span>
                        </a>
                    </td>
                    <td class="social-cell">
                        <a href="https://portfolio-dhinesh.me" class="social-link">
                            <div class="social-icon-box">
                                <img src="${logos.portfolio}" class="social-icon-img" alt="">
                            </div>
                            <span class="social-label">Portfolio</span>
                        </a>
                    </td>
                </tr>
            </table>
        </div>
        <div class="footer">DHINESH KUMAR // PORTFOLIO v2.4 // © ${new Date().getFullYear()}</div>
    </div>
</body>
</html>`;
}

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
  console.log(`⭐ Contact endpoint: http://localhost:${PORT}/api/contact`);
  console.log(`📸 Preview endpoint: http://localhost:${PORT}/api/preview-email?type=owner`);
});