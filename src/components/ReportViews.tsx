"use client";

import { useEffect } from "react";
import { fetchUrl } from "@/lib/utils";

export default function ReportView({
    slug,
    title,
    category
}: { slug: string, title: string, category: string }) {

    useEffect(() => {

        const postData = async () => {
            try {
                await fetch(`${fetchUrl}/count`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify({ slug, title, category })
                });
            } catch (err) {
                console.log('Error occured during the view count update', err);
            }
        }

        postData();

    }, [slug, title, category])


    // this function does not return anything 
    return <></>
}