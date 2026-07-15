const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Basic dotenv parser to read local .env
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          // Remove quotes
          if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    console.error("Failed to load .env file", e);
  }
}

loadEnv();

async function main() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER || 'gyanvendras2004@gmail.com';
  const pass = 'yufi czfr czts kraa';

  console.log('--- SMTP Diagnostic Test ---');
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`User: ${user}`);
  console.log(`Secure (SSL): ${port === 465}`);
  console.log(`Password length: ${pass.length} characters`);
  console.log('----------------------------\n');

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: {
      user: user,
      pass: pass
    },
    logger: true,
    debug: true
  });

  try {
    console.log('Connecting to server...');
    await transporter.verify();
    console.log('\n✅ SUCCESS: SMTP Credentials are correct! Connection verified successfully.');
  } catch (error) {
    console.log('\n❌ ERROR: Authentication failed.');
    console.error(error);
  }
}

main();
