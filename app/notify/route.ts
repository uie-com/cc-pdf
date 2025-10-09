
export async function GET() {

    const today = new Date();
    let todayStr = today.toISOString().slice(0, 10); // "YYYY-MM-DD"

    const airtableRes = await fetch(`https://api.airtable.com/v0/appq2AtsGzJm1CZJZ/tblGbefx3uho1OpkW?filterByFormula=${encodeURIComponent(`LEFT({Name}, 10)='${todayStr}'`)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await airtableRes.json();

    if (!data.records || data.records.length === 0) {
        console.log('[AIRTABLE] No records found for today: ' + todayStr);
        return new Response('No records found', { status: 200 });
    }

    console.log(`[AIRTABLE] Found ${data.records.length} records for today: ${todayStr}`);

    const records = data.records.map(async (record: any) => {
        const { id, fields } = record;
        let { 'Docs URL': doc, Name: name, 'PDF URL': url } = fields;

        if (!doc) {
            console.log(`[AIRTABLE] No URL found for doc: ${name}`);
            return null;
        }

        name = titleCase(name.substring(10).replaceAll('-', ' '));

        return await fetch(process.env.NOTIFY_WEBHOOK_URL ?? '', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, doc, url })
        });
    });

    for (const record of records) {
        const response = await record;
    }

    return new Response('Notifications sent', { status: 200 });

}

function titleCase(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function normalizeUrl(url: string) {
    if (!url.includes('export?format=pdf') && url.includes('docs.google.com/document'))
        url = url.replace(/\/d\/([^/]+)\/.*$/, '/d/$1/export?format=pdf');

    return url;
}