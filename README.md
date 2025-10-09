# PDF Link Service

The **PDF Link Service** is a lightweight web app that generates **permalinked PDFs** from Google Docs.  
Each PDF is automatically kept up to date — whenever you open the PDF link, you see the latest version of its source document.


## 🧭 Overview

This service provides a permanent PDF link for any Google Doc. The links act as live mirrors — instead of storing static copies, they fetch the newest version of the Google Doc and serve it as a downloadable PDF on request.

**Example use cases:**
- Sharing always-fresh documentation or reports.
- Embedding live-updating PDFs in dashboards or newsletters.
- Automating PDF distribution workflows from collaborative documents.


## ✨ Features

- **Dynamic PDFs** – Always up-to-date exports from linked Google Docs.
- **Simple API** – Create and retrieve PDF links programmatically.
- **Serverless hosting** – Runs as a Next.js app on Netlify.
- **Automation-ready** – Works seamlessly with no database servers or manual maintenance.


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

> ⚠️ **Security note:** These values must never be committed to source control.


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
`https://pdf.centercentre.com/view?q=2025-06-03_Metrics_Report`

Returns the live-updated PDF file corresponding to the stored document.


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


## 💡 Example Use

If you store project notes or reports in Google Docs, you can use the PDF Link Service to generate public-facing permalinks. Each link behaves like a “live PDF snapshot” — perfect for embedding in wikis, newsletters, or dashboards.

Example workflow:
1. Add your Google Doc to the system.
2. The service returns a unique PDF permalink.
3. Anyone with the link can open or download the always-updated PDF.


## 🧑‍💻 Contributing

Contributions are welcome!  
To get started:

1. Fork the repository.  
2. Create a feature branch (`feature/add-new-endpoint`).  
3. Submit a pull request once your changes are tested.

Please ensure your commits are well-documented and follow conventional commit standards.


## 🧾 License

This project is maintained by **CenterCentre UIE**.  
Released under the **MIT License**.

For additional details, setup instructions, or internal integrations, see the [PDF Link Service Documentation](https://www.notion.so/) (internal access required).


## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Netlify Deployments](https://docs.netlify.com/)
- [Airtable API Reference](https://airtable.com/api)
- [Google Docs Export API](https://developers.google.com/docs/api/reference/rest)
