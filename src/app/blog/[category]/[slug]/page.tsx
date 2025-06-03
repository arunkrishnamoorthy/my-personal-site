import { notFound } from "next/navigation";
import { formatDate, getBlogPosts } from "../../utils";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { BreadcrumbWithCustomSeparator } from "@/components/Breadcrumb";
import { CustomMDX } from "@/components/mdx";
import ReportView from "@/components/ReportViews";

type Params = Promise<{ category: string; slug: string }>


export async function generateStaticParams() {
    const posts = getBlogPosts();
    return posts.map((post) => ({
        slug: post.slug
    }))
}

export default async function Page({
    params
}: { params: Params }) {

    const { category, slug } = await params;
    const post = getBlogPosts().find((post) => post.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <>
            <ReportView category={post.metadata.category}
                title={post.metadata.title}
                slug={post.slug}></ReportView>
            <Header>
                <Container>
                    <BreadcrumbWithCustomSeparator category={post.metadata.category} slug={post.slug} />
                    <h1 className="title font-semibold text-2xl tracking-tighter mt-4">
                        {post.metadata.title}
                    </h1>
                    <div className="flex justify-between items-center mt-2 mb-4 text-sm">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                            {formatDate(post.metadata.publishedAt)}
                        </p>
                    </div>
                </Container>

            </Header>

            <Container>
                <article className="prose">
                    <CustomMDX source={post.content} />
                </article>
                {/* <p>{post.content}</p> */}
            </Container>

        </>
    )
}