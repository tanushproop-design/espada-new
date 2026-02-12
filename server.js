require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'applications.json');
const MEMBERS_FILE = path.join(__dirname, 'data', 'members.json');
const TIERS_FILE = path.join(__dirname, 'data', 'tiers.json');

// Admin Credentials
const ADMIN_USER = "EspadaPanel099";
const ADMIN_PASS = "Espada.exe099";

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.py': 'text/plain'
};

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send email notification
async function sendEmailNotification(formData) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `🔥 New Espada Application - ${formData.name}`,
        html: `
            <div style="background: #0f0f0f; color: #fff; padding: 20px; font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background: #1a0000; padding: 30px; border-radius: 10px; border: 2px solid #ff0000;">
                    <h2 style="color: #ff0000; text-align: center;">🔥 New Espada Application</h2>
                    
                    <div style="margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #ff0000;">
                        <div style="color: #ff0000; font-weight: bold;">Codename:</div>
                        <div style="color: #d1d1d1; margin-top: 5px;">${formData.name}</div>
                    </div>
                    
                    <div style="margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #ff0000;">
                        <div style="color: #ff0000; font-weight: bold;">Age:</div>
                        <div style="color: #d1d1d1; margin-top: 5px;">${formData.age}</div>
                    </div>
                    
                    <div style="margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #ff0000;">
                        <div style="color: #ff0000; font-weight: bold;">Discord ID:</div>
                        <div style="color: #d1d1d1; margin-top: 5px;">${formData.discord}</div>
                    </div>
                    
                    <div style="margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #ff0000;">
                        <div style="color: #ff0000; font-weight: bold;">Combat Experience:</div>
                        <div style="color: #d1d1d1; margin-top: 5px;">${formData.experience}</div>
                    </div>
                    
                    <div style="margin: 15px 0; padding: 10px; background: #050000; border-left: 3px solid #ff0000;">
                        <div style="color: #ff0000; font-weight: bold;">Why Espada:</div>
                        <div style="color: #d1d1d1; margin-top: 5px;">${formData.reason}</div>
                    </div>
                    
                    <hr style="border-color: #333; margin: 20px 0;">
                    
                    <div style="background: #ff0000; color: #000; padding: 10px; border-radius: 5px; text-align: center; font-weight: bold;">
                        📍 IP Address: ${formData.ip || 'Unknown'}
                    </div>
                    
                    <div style="margin-top: 10px; text-align: center; color: #666; font-size: 0.9rem;">
                        Submitted: ${formData.timestamp}
                    </div>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent for applicant: ${formData.name}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        return false;
    }
}

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Handle CORS for local development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/submit-application') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                data.timestamp = new Date().toISOString();

                // Save to JSON file (backup)
                let applications = [];
                if (fs.existsSync(DATA_FILE)) {
                    try {
                        applications = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                    } catch (e) { applications = []; }
                }
                applications.push(data);
                fs.writeFileSync(DATA_FILE, JSON.stringify(applications, null, 2));
                console.log(`📝 Application saved to file (total: ${applications.length})`);

                // Send Email notification
                const emailSent = await sendEmailNotification(data);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Application submitted successfully!',
                    emailSent: emailSent
                }));
            } catch (error) {
                console.error("Error processing submission:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
            }
        });
    } else if (req.method === 'POST' && req.url === '/api/login') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { username, password } = JSON.parse(body);
                if (username === ADMIN_USER && password === ADMIN_PASS) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, token: 'espada-admin-token-secured-99' }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Invalid credentials. Access Denied.' }));
                }
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, message: 'Invalid request' }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/api/data') {
        try {
            const members = JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
            const tiers = JSON.parse(fs.readFileSync(TIERS_FILE, 'utf8'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ members, tiers }));
        } catch (e) {
            console.error(e);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to read data' }));
        }
    } else if (req.method === 'POST' && req.url === '/api/data') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { members, tiers } = JSON.parse(body);
                // Simple atomic write - in prod use temp file + rename
                if (members) fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2));
                if (tiers) fs.writeFileSync(TIERS_FILE, JSON.stringify(tiers, null, 2));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                console.error(e);
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, message: 'Failed to save data' }));
            }
        });
    } else {
        // Serve static files
        let filePath = '.' + req.url;
        if (filePath === './' || filePath === './index.html') {
            filePath = './index.html';
        }

        const extname = path.extname(filePath);
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('404 Not Found');
                } else {
                    res.writeHead(500);
                    res.end('500 Internal Server Error: ' + error.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`\n🔥 Espada Server running at http://localhost:${PORT}/`);
    console.log(`📧 Email notifications: ${process.env.EMAIL_USER ? 'CONFIGURED' : 'NOT CONFIGURED (create .env file)'}`);
    console.log(`📁 Applications saved to: ${DATA_FILE}\n`);
});
