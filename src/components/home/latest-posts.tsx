import { formatDate, getLatestPosts } from "@/app/blog/utils";
import Link from "next/link";
import { Button } from "../ui/button";



export default function LatestPosts() {

    const posts = getLatestPosts();
    return (
        <>
            <h1 className="inline-block font-heading text-2xl tracking-tight lg:text-2xl pt-10">
                Recently Published
            </h1>
            {posts.map((post) => (
                <article key={post.slug} className="text-wrap max-w-md my-10">
                    <Link href={`blog/${post.metadata.category}/${post.slug}`}>
                        <h3 className="font-bold py-2 leading-5 hover:text-blue-400">{post.metadata.title}</h3>
                    </Link>
                    <p className="leading-8 my-5">{post.metadata.summary}</p>
                    <p className="text-sm text-muted-foreground">
                        {formatDate(post.metadata.publishedAt, true)}
                    </p>
                </article>
            ))}
            <div className="flex gap-2 items-center">
                <Button className="px-3 py-1 border rounded" variant={"ghost"} >Previous</Button>
                <span>
                    Page {1} of {20}
                </span>
                <Button className="px-3 py-1 border rounded" variant={"ghost"} >Next</Button>
            </div>
        </>
    )

}