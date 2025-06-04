'use client';
import { popularPosts } from "@/lib/placeholder-data"
import { Icons } from "@/components/ui/icon";
import useSWR from 'swr';
import { fetcher, fetchUrl } from "@/lib/utils";
import Link from "next/link";
import { PopularPostSkeleton } from "../skeleton/popular-posts";

export default function PopularPosts() {

    const popularPostUrl = `${fetchUrl}/posts/popular`;
    const { data, error, isLoading } = useSWR(popularPostUrl, fetcher);

    if (error) {
        return <div>Loading failed..</div>
    }

    if (isLoading) {
        return <PopularPostSkeleton />
    }

    return (
        <div className="overflow-auto">
            {data.map((post: { title: string, slug: string, category: string }) => (
                <Link href={`/blog/${post.category}/${post.slug}`} key={post.title}>
                    <li key={post.slug} className="flex items-center group gap-2 cursor-pointer py-2">
                        <Icons.arrowRight className="h-6 w-6 group-hover:translate-x-1 transition-all" />
                        <p>{post.title}</p>
                    </li>
                </Link>
            ))}
        </div>
    )
}