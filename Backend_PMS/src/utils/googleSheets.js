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

// Appends one row to the GroupForm tab - used both for a brand-new group
// request and for later single-student membership deltas (join/leave), so
// the sheet reads as an event log rather than something that gets rewritten
// in place on every membership change.
async function appendGroupSubmission({ groupName, projectTitle, supervisorName, leaderName, memberNames, memberStudentIds, status }) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'GroupForm!A:H', // tab must already exist in the same spreadsheet
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        groupName || '(unnamed)',
        projectTitle,
        supervisorName || '',
        leaderName,
        memberNames.join(', '),
        memberStudentIds.join(', '),
        status,
        new Date().toLocaleString(),
      ]],
    },
  });
}

module.exports = { appendContactSubmission, appendGroupSubmission };