import { db } from "@/db";

export async function GET(request: Request) {
    try {
        const blogs = await db.blogPost.findMany();
        return new Response(JSON.stringify(blogs), { status: 200 });
    } catch(err) {
        console.log(`Error fetching blog counts`, err);
        return new Response(`Failed to get blogs`, { status: 400 });
    }

}

export async function POST(request: Request) {

    const { slug, title, category } = await request.json();

    try {
        // check if this is an existing post in the db
        const existingPost = await db.blogPost.findUnique({
            where: {
                slug: slug
            }
        });
        if(existingPost) {
            await db.blogPost.update({
                where: { slug : slug },
                data: {
                    view_count: { increment: 1 }
                }
            })
        } else {
            // Find or create category
            let categoryRecord = await db.category.findFirst({
                where: {
                    OR: [
                        { slug: category.toLowerCase() },
                        { name: category }
                    ]
                }
            });

            if (!categoryRecord) {
                categoryRecord = await db.category.create({
                    data: {
                        name: category,
                        slug: category.toLowerCase().replace(/\s+/g, '-'),
                        description: `${category} blog posts`
                    }
                });
            }

            await db.blogPost.create({
                data: {
                    slug: slug,
                    title: title,
                    summary: title, // Use title as summary for now
                    content: '', // Empty content for now
                    category_id: categoryRecord.id,
                    published_at: new Date(),
                    is_published: true
                }
            })
        }
    } catch (err) {
        console.log("Error updating the view.. ", err);
        return new Response("Failed to post to DB" , { status: 500 });
    }
    return new Response("Successfully posted to DB", { status: 200 });
}