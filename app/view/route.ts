import { headers } from "next/headers"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    let name = req.nextUrl.searchParams.get('q');

    console.log('Fetching PDF link for ' + name);

    if (!name || name.length < 2) {
        return new Response(null, { status: 404 });
    }

    name = normalizeName(name);


    const airtableRes = await fetch(`https://api.airtable.com/v0/appq2AtsGzJm1CZJZ/tblGbefx3uho1OpkW?filterByFormula=${encodeURIComponent(`{Name} = "${name}"`)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (!airtableRes.ok) {
        return new Response(null, { status: 500 });
    }
    const airtableData = await airtableRes.json();
    if (!airtableData.records || airtableData.records.length === 0) {
        return new Response(null, { status: 404 });
    }

    const record = airtableData.records[0];
    const { id, fields } = record;
    let { 'Docs URL': url } = fields;

    if (!url) {
        return new Response(null, { status: 404 });
    }

    url = normalizeUrl(url);

    console.log('Fetching PDF from URL: ' + url);

    const res = await fetch(
        url,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/pdf',
                'Accept': 'application/pdf',
            },
        })

    const pdf = await res.arrayBuffer()
    const pdfBlob = new Blob([pdf], { type: 'application/pdf' })

    const pdfUrl = URL.createObjectURL(pdfBlob);
    return new Response(pdf, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="document.pdf"',
        },
    })
}

export async function POST(req: NextRequest) {
    let { url, name } = await req.json();

    console.log('Creating PDF link for ' + name + ' at URL: ' + url);

    if (!url || !name) {
        return new Response(null, { status: 400 });
    }

    let newUrl = '', originalName = name;
    name = normalizeName(name);

    const airtableGetRes = await fetch(`https://api.airtable.com/v0/appq2AtsGzJm1CZJZ/tblGbefx3uho1OpkW?filterByFormula=${encodeURIComponent(`{Name} = "${name}"`)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (!airtableGetRes.ok) {
        return new Response(null, { status: 500 });
    }

    const airtableGetData = await airtableGetRes.json();

    if (airtableGetData.records && airtableGetData.records.length > 0) {
        const record = airtableGetData.records[0];
        const { id } = record;
        const airtableUpdateRes = await fetch(`https://api.airtable.com/v0/appq2AtsGzJm1CZJZ/tblGbefx3uho1OpkW/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields: { 'Docs URL': url } })
        })

        if (!airtableUpdateRes.ok) {
            return new Response(null, { status: 500 });
        }
        newUrl = process.env.PUBLIC_URL + '?q=' + name;


        await fetch(process.env.EDIT_WEBHOOK_URL ?? '', {
            method: 'POST',
            headers: {},
            body: JSON.stringify({
                name: originalName,
                doc: url,
                url: newUrl,
            })
        });
    } else {
        const airtableRes = await fetch('https://api.airtable.com/v0/appq2AtsGzJm1CZJZ/tblGbefx3uho1OpkW', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ records: [{ fields: { Name: name, 'Docs URL': url } }] })
        });

        if (!airtableRes.ok) {
            return new Response(null, { status: 500 });
        }

        newUrl = process.env.PUBLIC_URL + '?q=' + name;

        await fetch(process.env.CREATE_WEBHOOK_URL ?? '', {
            method: 'POST',
            headers: {},
            body: JSON.stringify({
                name: originalName,
                doc: url,
                url: newUrl,
            })
        });
    }


    console.log('Created PDF link for ' + name + ' at URL: ' + newUrl);

    return new Response(JSON.stringify({ url: newUrl }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

function normalizeName(name: string) {
    return name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

function normalizeUrl(url: string) {
    if (!url.includes('export?format=pdf') && url.includes('docs.google.com/document'))
        url = url.replace(/\/d\/([^/]+)\/.*$/, '/d/$1/export?format=pdf');

    return url;
}