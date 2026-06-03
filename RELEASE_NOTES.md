# Jane's CRM - Stable Release

This version marks the completion of the core CRM workflow for Jane's Retreat Newsletter Follow-ups.

## Key Features & Automated Workflows

1. **Google Sheet Sync:** 
   * A Google Apps Script is installed on the master spreadsheet with an "On change" trigger. 
   * Every new form submission flies instantly into the Supabase database and populates the app in real-time.

2. **Auto-Hiding & Task Management:** 
   * The second Jane clicks "Draft Email" to hand off a template to Outlook, the app automatically hides the lead from her dashboard.
   * This keeps her daily to-do list perfectly clean and prevents double-emailing.

3. **Follow-Up Engine:** 
   * When an email is drafted, the app automatically pushes the lead's due date 7 days into the future.
   * If they haven't replied after 7 days, they magically pop back up on the dashboard under the "Due for Recontact" list.

4. **Live Pipeline Overview:** 
   * Jane has a live dashboard funnel showing exactly how many people are in the backlog, waiting for an initial email, or currently in active conversations, allowing her to perfectly pace her workload.

5. **Master Search Engine:** 
   * The Subscribers tab features a lightning-fast Server-Side search tool that bypasses database row limits. 
   * She can instantly search the entire database of 1,700+ historical leads in milliseconds without crashing the tablet.

6. **Deduplication Engine:**
   * The database enforces strict Row Level Security and unique constraints (`owner_id, email`).
   * Any duplicate emails imported from historical CSVs or the Google Sheet are automatically dropped to prevent double-emailing, leaving the original lead perfectly intact.

## Infrastructure
* **Frontend:** React + Vite, hosted on Netlify.
* **Database:** Supabase (PostgreSQL) with strict Row Level Security.
* **Styling:** Custom CSS focusing on a clean, premium tablet experience.
