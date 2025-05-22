"use client";

import { useState } from "react";

export default function Page() {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [output, setOutput] = useState("");

    const tryPost = async () => {
        const res = await fetch('/view', {
            method: 'POST',
            headers: {},
            body: JSON.stringify({
                name,
                url
            })
        });
        const data = await res.json();
        setOutput(data.url);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-4">
            <h1>Test Create PDF Link</h1>
            <input type="text" placeholder="Name" className=" p-2 m-4" onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="URL" className=" p-2 m-4" onChange={(e) => setUrl(e.target.value)} />
            <a onClick={tryPost} className=" bg-gray-400 cursor-pointer rounded-md text-white p-2">Try POST</a>

            <p className="text-gray-500 text-sm">This is a test page to create a PDF link:</p>
            <p className="text-gray-500 text-sm">{output}</p>
        </div>
    )
}