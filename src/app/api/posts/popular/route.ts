import { db } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
    const posts = await db.blog.findMany({
        orderBy: { view_count: "desc" },
        take: 5,
    });
    return NextResponse.json(posts);
}