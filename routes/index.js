const WebUntis = require('webuntis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configuration
const SCHOOL_NAME = 'OHG Nagold'; // Name der Schule
const USERNAME = 'SchmidPau'; // Dein Benutzername
const PASSWORD = 'FPgGjYHYk8'; // Dein Passwort
const SERVER = 'borys.webuntis.com'; // Server aus der URL
const EMAIL_TO_NOTIFY = 'paulschmid511@gmail.com'; // E-Mail-Adresse, die benachrichtigt werden soll
const OUTLOOK_EMAIL = 'schmidmoetzingen@outlook.com'; // Deine Outlook-E-Mail-Adresse
const OUTLOOK_PASSWORD = 'EQQe8QCt5dii8f'; // Dein Outlook-Passwort

// Create a transporter for sending emails using Outlook
const transporter = nodemailer.createTransport({
    service: 'Outlook365', // Outlook service
    auth: {
        user: OUTLOOK_EMAIL,
        pass: OUTLOOK_PASSWORD,
    },
});

// Function to check for new homework
async function checkHomework() {
    const webuntis = new WebUntis(SCHOOL_NAME, USERNAME, PASSWORD, SERVER);
    
    try {
        await webuntis.login();
        
        // Fetch homework assignments
        const homeworkList = await webuntis.getHomework();

        // Load existing homework to compare
        const existingHomework = await loadExistingHomework();

        if (homeworkList.length > 0) {
            const newHomework = homeworkList.find(hw => !existingHomework.includes(hw.id)); // Check for new homework

            if (newHomework) {
                sendEmail(newHomework);
                await saveExistingHomework(homeworkList.map(hw => hw.id)); // Save new homework IDs
            }
        }

    } catch (error) {
        console.error('Error checking homework:', error);
    }
}

// Function to send email
function sendEmail(homework) {
    const mailOptions = {
        from: OUTLOOK_EMAIL,
        to: EMAIL_TO_NOTIFY,
        subject: 'Neue Hausaufgabe zugewiesen',
        text: `Du hast neue Hausaufgaben: ${homework.title}\nBeschreibung: ${homework.description}\nFälligkeitsdatum: ${homework.dueDate}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error sending email:', error);
        }
        console.log('Email sent:', info.response);
    });
}

// Load existing homework from a JSON file
const homeworkFilePath = path.join(__dirname, 'homework_ids.json');

async function loadExistingHomework() {
    if (fs.existsSync(homeworkFilePath)) {
        const data = fs.readFileSync(homeworkFilePath);
        return JSON.parse(data);
    }
    return [];
}

// Save existing homework IDs to a JSON file
async function saveExistingHomework(existingHomeworkIds) {
    fs.writeFileSync(homeworkFilePath, JSON.stringify(existingHomeworkIds));
}

// Check homework every 10 minutes
setInterval(checkHomework, 10 * 60 * 1000);

// Start the first check immediately
checkHomework();
