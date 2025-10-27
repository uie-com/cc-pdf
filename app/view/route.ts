import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    let name = req.nextUrl.searchParams.get('q');

    console.log('Fetching PDF link for ' + name);

    if (!name || name.length < 2) {
        console.log('[ERROR] Invalid doc name: ' + name);
        redirect('https://centercentre.com/');
    }

    name = normalizeName(name);


    let airtableRes = await fetch(`https://api.airtable.com/v0/appq2AtsGzJm1CZJZ/tblGbefx3uho1OpkW?filterByFormula=${encodeURIComponent(`{Name} = "${name}"`)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (!airtableRes.ok) {
        console.log('[ERROR] Failed to fetch from Airtable: ' + airtableRes.status);

        redirect('https://centercentre.com/');
    }

    let airtableData = await airtableRes.json();
    if (!airtableData.records || airtableData.records.length === 0) {
        console.log('[ERROR] No records found for doc: ' + name);
        const noDateName = name.substring(10, name.length);

        let airtableRes = await fetch(`https://api.airtable.com/v0/appq2AtsGzJm1CZJZ/tblGbefx3uho1OpkW?filterByFormula=${encodeURIComponent(`RIGHT({Name}, LEN("${noDateName}")) = "${noDateName}"`)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!airtableRes.ok) {
            // If ends with 'cohort-x-topic-y', swap to 'topic-y-cohort-x' and try again
            const nameParts = name.split('-');
            if (nameParts.length >= 4) {
                const cohortIndex = nameParts.findIndex(part => part === 'cohort');
                const topicIndex = nameParts.findIndex(part => part === 'topic');
                if (cohortIndex !== -1 && topicIndex !== -1 && cohortIndex < topicIndex) {
                    const newNameParts = [...nameParts];
                    const cohortPart = newNameParts.splice(cohortIndex, 2);
                    const topicPart = newNameParts.splice(topicIndex - 2, 2);
                    newNameParts.push(...topicPart, ...cohortPart);
                    const newName = newNameParts.join('-');

                    console.log('[INFO] Trying alternative name: ' + newName);

                    airtableRes = await fetch(`https://api.airtable.com/v0/appq2AtsGzJm1CZJZ/tblGbefx3uho1OpkW?filterByFormula=${encodeURIComponent(`{Name} = "${newName}"`)}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    });

                }
            }
        }

        if (!airtableRes.ok) {
            console.log('[ERROR] Failed to fetch from Airtable: ' + airtableRes.status);
            redirect('https://centercentre.com/');
        }
        airtableData = await airtableRes.json();
        if (!airtableData.records || airtableData.records.length === 0) {
            console.log('[ERROR] No records found for doc: ' + noDateName);
            redirect('https://centercentre.com/');
        }
    }

    const record = airtableData.records[0];
    const { id, fields } = record;
    let { 'Docs URL': url } = fields;

    if (!url) {
        console.log('[ERROR] No URL found for doc: ' + name);
        redirect('https://centercentre.com/');
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

    console.log('[GET] PDF URL: ' + pdfUrl);
    return new Response(pdf, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="document.pdf"',
        },
    })
}

export async function POST(req: NextRequest) {
    let { url, name, message } = await req.json();
    if (!message)
        message = true;

    console.log('Creating PDF link for ' + name + ' at URL: ' + url);

    if (!url || !name) {
        console.log('[ERROR] Invalid doc name or URL: ' + name + ' ' + url);
        redirect('https://centercentre.com/');
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
        console.log('[ERROR] Failed to fetch from Airtable: ' + airtableGetRes.status);
        redirect('https://centercentre.com/');
    }

    const airtableGetData = await airtableGetRes.json();

    if (airtableGetData.records && airtableGetData.records.length > 0 && airtableGetData.records[0].fields['Docs URL'] === url) {
        newUrl = process.env.PUBLIC_URL + '?q=' + name;
        console.log('[POST] URL already exists for ' + name + ' at URL: ' + newUrl);
        return new Response(JSON.stringify({ url: newUrl }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } else if (airtableGetData.records && airtableGetData.records.length > 0) {


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
            console.log('[ERROR] Failed to update Airtable: ' + airtableUpdateRes.status);
            redirect('https://centercentre.com/');
        }
        newUrl = process.env.PUBLIC_URL + '?q=' + name;

        if (message && message !== 'false')
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
            console.log('[ERROR] Failed to create Airtable record: ' + airtableRes.status);
            redirect('https://centercentre.com/');
        }

        newUrl = process.env.PUBLIC_URL + '?q=' + name;

        if (message && message !== 'false')
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


    console.log('[POST] Created PDF link for ' + name + ' at URL: ' + newUrl);

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