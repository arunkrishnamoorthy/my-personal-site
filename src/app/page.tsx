import Container from "@/components/Container";
import LatestPosts from "@/components/home/latest-posts";
import PopularPosts from "@/components/home/popular-posts";
import TopCategories from "@/components/home/top-categories";
import { MainNav } from "@/components/ui/main-nav";


export default function Home() {
  return (
    <Container>
      <MainNav />

      {/* Background gradient for light mode */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-50/30 via-white to-white dark:from-background dark:via-background dark:to-background pointer-events-none"></div>

      <main className="flex flex-col items-start justify-between mt:16 md:flex-row">
        <div>
          <LatestPosts />
        </div>
        <div className="h-screen mt-10">
          <div>
            <h1 className="font-bold mb-4">Top Categories</h1>
              <TopCategories />
          </div>
          <div className="mt-10 top-0">
            <h1 className="font-bold mb-4">Popular Posts</h1>
              <PopularPosts />
          </div>
        </div>
      </main>
    </Container>
  );
}
