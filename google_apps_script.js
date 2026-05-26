// Google Apps Script to send new rows to Supabase
// 1. Go to your Google Sheet -> Extensions -> Apps Script
// 2. Paste this code
// 3. Replace the placeholders below with your actual Supabase URL and Anon Key
// 4. Click the "Save" icon
// 5. Go to "Triggers" (clock icon on the left) -> Add Trigger
// 6. Choose function to run: "onFormSubmit"
// 7. Select event type: "On form submit"
// 8. Save and accept permissions.

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE'; 
const SUPABASE_SECRET_KEY = 'YOUR_SUPABASE_SECRET_KEY_HERE';
const YOUR_USER_ID = 'YOUR_USER_ID_HERE'; // We need this to link the subscriber to your account!

// Make sure this matches the exact name of the tab in your Google Sheet where the form data lands
const SHEET_NAME = 'Sheet1'; 

function onFormSubmit(e) {
  // If the event object doesn't exist, this was run manually, not by a trigger
  if (!e) return;
  
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;
  
  // Get the values of the row that was just added
  const rowValues = e.values;
  
  // NOTE: Adjust these indices based on the order of columns in your Google Sheet
  // e.values is an array starting at index 0.
  // For example:
  // rowValues[0] = Timestamp
  // rowValues[1] = First Name
  // rowValues[2] = Last Name
  // rowValues[3] = Email
  
  const firstName = rowValues[1] || '';
  const lastName = rowValues[2] || '';
  const email = rowValues[3] || '';
  
  if (!email) return; // Need at least an email
  
  const payload = {
    owner_id: YOUR_USER_ID,
    email: email.trim(),
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    intent_status: 'unknown',
    source: 'google_sheets_form'
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'apikey': SUPABASE_SECRET_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SECRET_KEY,
      'Prefer': 'return=minimal' // Don't return the inserted row data to save bandwidth
    },
    payload: JSON.stringify(payload)
  };

  try {
    // Send the data directly to your Supabase subscribers table
    UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/subscribers`, options);
  } catch (error) {
    console.error('Error sending data to Supabase:', error);
  }
}
