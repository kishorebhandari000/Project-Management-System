const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function appendContactSubmission({ name, email, message }) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'CONTACTFORM!A:D', // adjust 'Sheet1' if you renamed the tab
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[name, email, message, new Date().toLocaleString()]],
    },
  });
}

module.exports = { appendContactSubmission };