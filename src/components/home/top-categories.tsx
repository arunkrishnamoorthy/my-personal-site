// import { categories } from "@/lib/placeholder-data"
import { Button } from '@/components/ui/button'
import { getCategoriesFromGit } from '@/lib/fetchMdxFromGithub';
import Link from "next/link"

export default async function TopCategories() {

    let categories = await getCategoriesFromGit();
    if (!categories || categories.length === 0) {
        categories = [];
    }
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
            {categories.map((category) => (
                <Button key={category} variant={"secondary"} className="hover:scale-110 transition-all" asChild>
                    <Link href={`/blog/${category}`}>
                        <p className="text-wrap">{category}</p>
                    </Link>
                </Button>
            ))}
        </div>
    )
}