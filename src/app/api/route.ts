import { db } from "@/db";

export async function GET() {
    return new Response(JSON.stringify({ data: ['a','b','c'] }), { status: 200 });
}

export async function POST(request: Request) {

    const { slug, title, category } = await request.json();

    try {
        // check if this is an existing post in the db 
        const existingPost = await db.blog.findUnique({
            where: {
                slug: slug
            }
        });
        if(existingPost) {
            await db.blog.update({
                where: { slug : slug },
                data: {
                    view_count: { increment: 1 }
                }
            })
        } else {
            await db.blog.create({
                data: {
                    slug: slug,
                    title: title,
                    category: category
                }
            })
        }
    } catch (err) {
        console.log("Error updating the view.. ", err);
        return new Response("Failed to post to DB" , { status: 500 });
    }
    return new Response("Successfully posted to DB", { status: 200 });
}