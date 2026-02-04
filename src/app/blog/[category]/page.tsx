import { notFound } from "next/navigation";
import { getBlogPosts } from "@/app/blog/utils";
import Link from "next/link";
import CardCategory from "@/components/CardCategory";
import Container from "@/components/Container";
import Header from "@/components/Header";


export async function generateStaticParams() {
    const posts = getBlogPosts();
    return posts.map((post) => ({
        category: post.metadata.category
    }))
}


export default async function Page({ params }: { params: Promise<{ category: string }> }) {

    const { category } = await params;

    const posts = getBlogPosts().filter((post) => post.metadata.category === category);

    if (!posts.length) {
        notFound();
    }

    return (
        <>
            {/* Background gradient for light mode */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-background dark:via-background dark:to-background pointer-events-none"></div>

            <Header>
                <Container>
                    <h1 className="title font-semibold text-2xl tracking-wider mt-4 uppercase">
                        {posts[0]?.metadata.category}
                    </h1>
                </Container>
            </Header>
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
                    {posts.map((post) => (
                        <Link href={`/blog/${post.metadata.category}/${post.slug}`}
                            key={post.slug}>
                            <CardCategory title={post.metadata.title}
                                summary={post.metadata.summary}
                                date={post.metadata.publishedAt} />
                        </Link>
                    ))}
                </div>
            </Container>
        </>
    )
}