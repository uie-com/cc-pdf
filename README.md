# PDF Link Service

The **PDF Link Service** is a lightweight web app that generates **permalinked PDFs** from Google Docs.  
Each PDF is automatically kept up to date — whenever you open the PDF link, you see the latest version of its source document.


## 🧭 Overview

This service provides a permanent PDF link for any Google Doc. The links act as live mirrors — instead of storing static copies, they fetch the newest version of the Google Doc and serve it as a downloadable PDF on request.

Google Docs will provide PDF copies of documents, but only in a custom viewer that cannot be accessed in certain environments.

**Example use cases:**
- Sharing documents to government or restricted networking environments.
- Embedding live-updating PDFs in dashboards or newsletters.
- Automating PDF distribution workflows from collaborative documents.


## ✨ Features

- **Dynamic PDFs** – Always up-to-date exports from linked Google Docs.
- **Simple API** – Create and retrieve PDF links programmatically.
- **Serverless hosting** – Runs as a Next.js app on Netlify.
- **Automation-ready** – Works seamlessly with no manual maintenance.


## 🌐 How It Works

1. **Create a Link**  
   The service stores a mapping between a unique PDF ID and the corresponding Google Doc URL.

2. **View the PDF**  
   When a PDF is accessed, the service:
   - Looks up the Google Doc by its stored ID.
   - Generates a PDF on the fly using Google Docs’ native export feature.
   - Streams the resulting file to the browser.

3. **Automatic Updates**  
   Since each view fetches directly from Google Docs, no manual updates are required. The PDF always reflects the most recent version.


## 🚀 Quick Start

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/uie-com/cc-pdf
cd cc-pdf
npm install
```

### 2. Development

Run locally with:

```bash
npm run dev
```

By default, the app runs on `http://localhost:3000`.

### 3. Environment Variables

You’ll need to configure the following environment variables in a `.env.local` file:

| Variable | Description |
|-----------|-------------|
| `AIRTABLE_TOKEN` | Access token for the Airtable database that stores PDF mappings |
| `PUBLIC_URL` | The base URL for your local or deployed instance |
| `CREATE_WEBHOOK_URL` | (Optional) Webhook URL to notify when a PDF is created |
| `EDIT_WEBHOOK_URL` | (Optional) Webhook URL to notify when a PDF is edited |
| `NOTIFY_WEBHOOK_URL` | (Optional) Webhook for daily PDF summaries |

> ⚠️ **Reminder:** These values must never be committed to source control.

## ⚙️ Architecture

**Core components:**

| Component | Purpose |
|------------|----------|
| **Next.js App** | API routes `/view` and `/notify` |
| **Airtable Database** | Stores document mappings and metadata |
| **Google Docs Export API** | Provides live PDF export |
| **Webhooks** | Sends notifications to external services (e.g., Slack, email, or chat tools) |
| **Cron Job (Optional)** | Automates daily PDF summaries |

## 🧠 Airtable Schema

The service relies on a single Airtable base (table) with the following fields:

| Field Name | Type | Description |
|-------------|------|-------------|
| `Name` | **Single line text** | Unique ID for each PDF, formatted like `YYYY-MM-DD Report Title` |
| `Docs URL` | **URL** | The full Google Docs link that will be converted to a PDF |
| `PDF URL` | **URL** _(optional)_ | The generated permalink served by this service |

**Table Behavior:**
- The `Name` field acts as the unique key.
- The `/view` API creates or updates records based on `Name`.
- The `/notify` API queries for records with today’s date prefix (e.g., `2025-10-09`).


## 🧠 API Reference

### Create a PDF Link

**Endpoint:**  
`POST /view`

**Body Parameters:**

| Field | Type | Description |
|--------|------|-------------|
| `url` | `string` | The Google Docs URL to link |
| `name` | `string` | A unique identifier for the PDF (e.g., `2025-06-03_Metrics_Report`) |
| `message` | `boolean` | Optional. Whether to trigger webhook notifications |

**Response:**
Returns a JSON object containing the permalink to the new PDF.


### View a PDF

**Endpoint:**  
`GET /view?q=<PDF_ID>`

Example:  
`https://pdf.company.com/view?q=2025-06-03_Metrics_Report`

Returns the live-updated PDF file corresponding to the stored document.

### Send a Daily Report
Sends a summary webhook with a list of PDFs that are marked with today's date. Can be used for easy access to daily or event-specific documents. Requires document IDs begin with the format "YYYY-MM-DD".

**Endpoint:**  
`GET /notify`

**Purpose**
- Queries Airtable for all records whose `{Name}` starts with today’s date (e.g. `2025-10-09`).  
- Posts each record to a webhook endpoint (`NOTIFY_WEBHOOK_URL`).

**Response:**
'Notifications sent successfully' or 'No records found for today'

## 🏗️ Architecture

- **Framework:** [Next.js](https://nextjs.org/)
- **Deployment:** [Netlify](https://www.netlify.com/)
- **Database:** [Airtable](https://airtable.com/)
- **PDF Source:** Google Docs Export API

**Flow summary:**
1. `POST /view` → creates or updates a link record in Airtable.  
2. `GET /view?q=...` → fetches the Google Docs PDF export.  
3. Optional integrations (Zapier, cron jobs, webhooks) handle automation.


## ⚙️ Integrations

The service can integrate with third-party tools for automation:

- **Zapier / Make.com:** Automatically generate or update PDF links when Google Docs change.  
- **Cron Jobs:** Schedule daily summaries or sync checks.  
- **Slack / Email Webhooks:** Notify teams when new PDFs are generated.

> These integrations are optional — the core app functions independently.

## 🔔 Webhook Integrations

Webhooks are optional and triggered automatically when records are **created**, **updated**, or **summarized**.

### Create Webhook (`CREATE_WEBHOOK_URL`)
Triggered after a new link is created.

**Payload Example**
```json
{
  "name": "2025-06-03 Metrics Topic 4",
  "doc": "https://docs.google.com/document/d/123abc/edit",
  "url": "https://pdf.company.com/view?q=2025-06-03-metrics-topic-4"
}
```

---

### Edit Webhook (`EDIT_WEBHOOK_URL`)
Triggered after a link is updated (same name, new Google Doc URL).

**Payload Example**
```json
{
  "name": "2025-06-03 Metrics Topic 4",
  "doc": "https://docs.google.com/document/d/456def/edit",
  "url": "https://pdf.company.com/view?q=2025-06-03-metrics-topic-4"
}
```

---

### Notify Webhook (`NOTIFY_WEBHOOK_URL`)
Triggered daily via `/notify`, once per record created today.

**Payload Example**
```json
{
  "name": "Metrics Topic 4",
  "docLink": "https://docs.google.com/document/d/123abc/edit",
  "pdfLink": "https://pdf.company.com/view?q=2025-06-03-metrics-topic-4"
}
```

**Expected Response**
A `200 OK` acknowledgment from the receiving service is sufficient.  
No retry logic is built in; use an external job monitor if reliability is required.


## 💡 Example Use

If you store project notes or reports in Google Docs, you can use the PDF Link Service to generate public-facing permalinks. Each link behaves like a “live PDF snapshot” — perfect for sharing or downloading for further automation.

Example workflow:
1. Add your Google Doc to the system.
2. The service returns a unique PDF permalink.
3. Anyone with the link can open or download the always-updated PDF.

OR

1. A polling Zapier automation searches for new Docs links in a database
2. It makes an API call to this service and stores the new link
3. The database now always has a direct access link