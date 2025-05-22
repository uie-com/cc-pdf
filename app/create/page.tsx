"use client";

import { Anchor, Button, Flex, MantineProvider, Text, TextInput, Title } from "@mantine/core";
import { useState } from "react";

export default function Page() {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");

    const [status, setStatus] = useState("ready");

    const [links, setLinks] = useState<string[]>([]);
    const [names, setNames] = useState<string[]>([]);

    const tryPost = async () => {
        setStatus("loading");

        const res = await fetch('/view', {
            method: 'POST',
            headers: {},
            body: JSON.stringify({
                name,
                url
            })
        });

        if (!res.ok) {
            setStatus("error");
            return;
        }

        const data = await res.json();

        setLinks((prev) => prev.concat(data.url));
        setNames((prev) => prev.concat(name));

        setName('');
        setUrl('');

        setStatus("success");
        navigator.clipboard.writeText(data.url);

        setTimeout(() => {
            setStatus("ready");
        }, 1000);
    }

    return (
        <MantineProvider >
            <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-2 ">
                <Flex direction={"column"} gap="md" justify={'start'} align={'start'} className="w-full max-w-md p-8 rounded-lg border-1 border-gray-100 bg-gray-50">
                    <Title order={1}>Create PDF Link</Title>
                    <Text c='gray.6' className="!text-sm !-mt-2 !mb-2">Add a Google Doc Link, and this tool will create a permanent URL for a up-to-date PDF version.</Text>

                    <TextInput size="lg" name="name-search" type="text" description="Name" placeholder="ex. 2025-05-22 TUXS Notes" className=" " value={name} onChange={(e) => setName(e.target.value)} w={360} />
                    <TextInput size="lg" name="url-search" type="text" description="Google Docs URL" placeholder="ex. https://docs.google.com/..." value={url} onChange={(e) => setUrl(e.target.value)} w={360} />

                    <Button size='md' onClick={tryPost} className=" bg-gray-400 cursor-pointer rounded-md text-white mt-4" loading={status === 'loading'} color={status === 'error' ? 'orange.4' : status === 'success' ? 'green' : 'blue'}>{status === 'error' ? 'Error Creating Link' : status === 'success' ? 'Copied Link to Clipboard' : 'Create Link'}</Button>

                    <Anchor className=" alifn" href="https://centercentre.slack.com/archives/C08TNR13R98"><Text c='gray.5' className="!text-sm !-mb-2">See Links in the Slack channel #pdf_links.</Text></Anchor>

                </Flex>
            </div>
        </MantineProvider>
    )
}