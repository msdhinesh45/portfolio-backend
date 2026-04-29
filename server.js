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

// 🎨 Preview Endpoint
app.get('/api/preview-email', (req, res) => {
  const name = "John Doe";
  const email = "john@example.com";
  const message = "Hi Dhinesh! Your portfolio is exceptional. Let's discuss a collaboration.";
  const type = req.query.type || 'owner';
  const html = type === 'owner' ? getOwnerTemplate(name, email, message) : getAckTemplate(name, email, message);
  res.send(html);
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const owner = process.env.OWNER_EMAIL || user;

  if (!user || !pass) return res.status(500).json({ error: 'Email config error' });

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    await transporter.sendMail({ from: user, to: owner, subject: `📡 SIGNAL: ${name}`, html: getOwnerTemplate(name, email, message) });
    await transporter.sendMail({ from: user, to: email, subject: `✅ LOGGED: Hi ${name}`, html: getAckTemplate(name, email, message) });
    return res.status(200).json({ message: 'Sent' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed', detail: err.message });
  }
});

function getOwnerTemplate(name, email, message) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=JetBrains+Mono&display=swap');
        body { margin:0; padding:10px; background:#020617; font-family:'Plus Jakarta Sans',sans-serif; color:#fff; }
        .container { max-width:600px; margin:0 auto; background:#0f172a; border-radius:24px; border:1px solid rgba(34,211,238,0.1); overflow:hidden; }
        .header { padding:40px 20px; text-align:center; background:radial-gradient(circle at top right, rgba(34,211,238,0.1), transparent); }
        .title { font-size:24px; font-weight:800; margin:0; }
        .content { padding:30px 20px; }
        .card { background:rgba(255,255,255,0.03); border-radius:16px; padding:20px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.05); }
        .label { font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:2px; margin-bottom:5px; }
        .value { font-size:15px; font-weight:600; color:#22d3ee; }
        .msg { font-family:'JetBrains Mono',monospace; font-size:13px; color:#cbd5e1; background:rgba(0,0,0,0.2); padding:20px; border-radius:12px; line-height:1.6; }
        .footer { padding:20px; text-align:center; font-size:10px; color:#475569; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1 class="title">New Intel Received</h1></div>
        <div class="content">
            <div class="card"><div class="label">Origin</div><div class="value">${name}</div></div>
            <div class="card"><div class="label">Contact</div><div class="value">${email}</div></div>
            <div class="label" style="color:#a855f7">Transmission</div>
            <div class="msg">${message}</div>
        </div>
        <div class="footer">DHINESH KUMAR // ${new Date().getFullYear()}</div>
    </div>
</body>
</html>`;
}

function getAckTemplate(name, email, message) {
  const logos = {
    linkedin: "https://api.iconify.design/logos:linkedin-icon.svg",
    github: "https://api.iconify.design/simple-icons:github.svg?color=%23ffffff",
    instagram: "https://api.iconify.design/skill-icons:instagram.svg",
    portfolio: "https://api.iconify.design/lucide:globe.svg?color=%2322d3ee"
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&family=JetBrains+Mono&display=swap');
        body { margin:0; padding:10px; background:#020617; font-family:'Plus Jakarta Sans',sans-serif; color:#fff; }
        .container { max-width:600px; margin:0 auto; background:#0f172a; border-radius:24px; border:1px solid rgba(168,85,247,0.1); overflow:hidden; }
        .header { padding:50px 20px; text-align:center; background:linear-gradient(135deg, #0f172a, #1e1b4b); }
        .title { font-size:28px; font-weight:800; color:#fff; }
        .title span { color:#22d3ee; }
        .content { padding:40px 20px; }
        .preview { background:rgba(0,0,0,0.2); border-left:3px solid #a855f7; padding:20px; border-radius:12px; margin:20px 0 40px; font-style:italic; color:#cbd5e1; font-size:14px; }
        
        /* Responsive Social Grid */
        .social-container { text-align:center; width:100%; }
        .social-item { 
            display:inline-block; 
            width:60px; 
            margin:10px; 
            text-decoration:none; 
            vertical-align:top;
        }
        .icon-box { 
            width:56px; height:56px; 
            background:rgba(255,255,255,0.03); 
            border:1px solid rgba(255,255,255,0.1); 
            border-radius:16px; 
            display:flex; align-items:center; justify-content:center; 
            margin:0 auto 8px;
        }
        .icon-img { width:28px; height:28px; display:block; }
        .label { font-size:9px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px; }

        @media only screen and (max-width: 480px) {
            .title { font-size: 24px; }
            .social-item { width: 50px; margin: 5px; }
            .icon-box { width: 48px; height: 48px; }
            .icon-img { width: 24px; height: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1 class="title">Signal <span>Locked.</span></h1></div>
        <div class="content">
            <h2 style="font-size:20px;">Hello, <span style="color:#a855f7">${name}</span>!</h2>
            <p style="color:#94a3b8; line-height:1.6;">Your transmission has been received. I've successfully logged your message into my response queue.</p>
            <div class="preview">"${message}"</div>
            
            <div style="text-align:center; font-size:11px; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:2px; margin-bottom:20px;">Active Channels</div>
            <div class="social-container">
                <a href="https://linkedin.com/in/dhineshkumar45" class="social-item">
                    <div class="icon-box"><img src="${logos.linkedin}" class="icon-img"></div>
                    <div class="label">LinkedIn</div>
                </a>
                <a href="https://github.com/msdhinesh45" class="social-item">
                    <div class="icon-box"><img src="${logos.github}" class="icon-img"></div>
                    <div class="label">GitHub</div>
                </a>
                <a href="https://instagram.com/_ms_dhinesh_" class="social-item">
                    <div class="icon-box"><img src="${logos.instagram}" class="icon-img"></div>
                    <div class="label">Instagram</div>
                </a>
                <a href="https://portfolio-dhinesh.me" class="social-item">
                    <div class="icon-box"><img src="${logos.portfolio}" class="icon-img"></div>
                    <div class="label">Portfolio</div>
                </a>
            </div>
        </div>
        <div class="footer">DHINESH KUMAR // © ${new Date().getFullYear()}</div>
    </div>
</body>
</html>`;
}

app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));