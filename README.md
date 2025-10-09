# PDF Link Service

The **PDF Link Service** generates and serves **permalinked PDFs** based on Google Docs.  
Each PDF reflects the **latest version** of its source Google Doc whenever it’s viewed.

---

## 🧭 Overview

This service converts live Google Docs into permanent PDF links that always show the most up-to-date content.

- Each link corresponds to a single Google Doc.  
- PDFs are generated dynamically whenever someone accesses the permalink.  
- Links are stored and tracked through Airtable and announced automatically in Slack.

**PDF and Doc links** are listed in the **📆 Calendar** tab of the [Programs Airtable](https://www.notion.so/Programs-209903316fdd80059f54df4f1db886da?pvs=21) and in the `#collab-notes` Slack channel.

---

## 🚀 Features & Usage

### Create a PDF Link

- Go to [https://pdf.centercentre.com/create](https://pdf.centercentre.com/create)
- Enter the Google Doc URL and metadata to generate a permalink.
- Each new link sends a Slack notification to `#collab-notes`.

### View a PDF Link

- Open `https://pdf.centercentre.com/view?q=[PDF_ID]`  
  Example:  
  {{backtick}}{{backtick}}{{backtick}}
  https://pdf.centercentre.com/view?q=2025-06-03%20Metrics%20Topic%204
  {{backtick}}{{backtick}}{{backtick}}

### Automatic PDF Creation

- PDFs are auto-generated for any **Collab Notes Link** added to the [Programs Airtable](https://www.notion.so/Programs-209903316fdd80059f54df4f1db886da?pvs=21).  
- They appear in the **📆 Calendar** tab and trigger a Slack notification in `#collab-notes`.

### Deleting Links

- Deleting a Collab Notes Link also removes its associated PDF entry.  
- ⚠️ **Wait for the deletion confirmation in `#collab-notes` before re-adding a link**, to avoid ID conflicts.

---

## 🧩 Developer Features

### Notify / Daily Summary

Ping the endpoint below to send the daily summary of PDFs created that day:

{{backtick}}{{backtick}}{{backtick}}
GET https://pdf.centercentre.com/notify
{{backtick}}{{backtick}}{{backtick}}

This message tags everyone in `#collab-notes` with that day’s Collab Notes summary.

### Create a PDF via API

{{backtick}}{{backtick}}{{backtick}}
POST https://pdf.centercentre.com/view
{{backtick}}{{backtick}}{{backtick}}

**Body parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `url` | string | Google Docs URL |
| `name` | string | PDF ID (e.g. `2025-06-03 Metrics Topic 4`) |
| `message` | boolean | Whether to send a Slack notification to `#pdf-links` |

---

## ⚙️ How It Works

The service is a **Next.js app** hosted on **Netlify**, connected to a GitHub repo for automatic deploys:  
👉 [Netlify Project Dashboard](https://app.netlify.com/projects/uie-pdf/overview)

### Core Logic

1. **Creating a PDF Link**
   - Stores `(PDF ID, Google Doc URL)` in the [Database - PDFs](https://www.notion.so/Database-PDFs-209903316fdd801992c5e4039a6f2474?pvs=21) Airtable.
   - If an ID already exists, it overwrites the entry.

2. **Viewing a PDF**
   - Fetches the Google Doc URL from Airtable.
   - Converts it to a direct Google Docs PDF export URL.
   - Streams the resulting PDF back to the user.

3. **Daily Summary**
   - At 8:30 AM ET, the `/notify` endpoint collects all PDFs created today (IDs starting with today’s date) and sends a message to `#collab-notes`.

---

## 🔁 Integrations & Automations

The service relies on several integrations to stay in sync.

### Zapier: Generate Collab Note PDF Links
[View the Zap](https://zapier.com/editor/299280482/published?conversationId=c5eddf5d-1b65-4586-8dd5-9c0f38ba6bdd)

- Polls the [Programs - Sync Utility](https://www.notion.so/Programs-Sync-Utility-209903316fdd802b96adeeb413b0a7ff?pvs=21) Airtable for changes.  
- On new/edited Collab Notes Links:
  - Calls the `/view` endpoint to generate the PDF link.
  - Saves the permalink back to Airtable.
- If a note is deleted, it removes the matching record from both:
  - [Database - PDFs](https://www.notion.so/Database-PDFs-209903316fdd801992c5e4039a6f2474?pvs=21)
  - [Programs - Sync Utility](https://www.notion.so/Programs-Sync-Utility-209903316fdd802b96adeeb413b0a7ff?pvs=21)

⚠️ If the cleanup lags behind a replacement, you may need to manually remove outdated entries from **Database - PDFs** to prevent incorrect summaries.

### Cron Jobs

A daily job managed in [Cron Jobs](https://www.notion.so/Cron-Jobs-285903316fdd80ef9cd5c5ec8827e512?pvs=21) triggers the `/notify` endpoint at **8:30 AM ET**.

---

## 🧑‍💻 Local Development

Clone the repository:

{{backtick}}{{backtick}}{{backtick}}bash
git clone https://github.com/uie-com/cc-pdf
cd cc-pdf
{{backtick}}{{backtick}}{{backtick}}

Install dependencies and start the dev server:

{{backtick}}{{backtick}}{{backtick}}bash
npm install
npm run dev
{{backtick}}{{backtick}}{{backtick}}

### Environment Variables

Create a `.env` file in the project root.

See [the Notion documentation for the file.](https://www.notion.so/centercentre/PDF-Link-Service-21b903316fdd80dba9a2ec36af271f02?source=copy_link)

### Deployment

Changes are automatically deployed via **Netlify** once pushed to the main branch.  
To publish manually or via droplet, follow [CC Droplet instructions](https://www.notion.so/CC-Droplet-285903316fdd808f9d2def5d7f44c9a8?pvs=21).

---

## 🧾 License

This project is internal to **CenterCentre UIE** and intended for internal use only.  
Do not redistribute without authorization.