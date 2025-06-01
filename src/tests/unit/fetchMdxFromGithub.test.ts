import { fetchMdxContent, getCategoriesFromGit } from "@/lib/fetchMdxFromGithub";

describe("fetchMdxContent", () => {

    it("fetches MDX content from github", async () => {
        const content = await fetchMdxContent('test');
        console.log(content);
        expect(content).toContain("Efficiency");
    });

});


describe("Fetch categories from Git Branch",() => {

    it("get the list of categories from the main branch" , async () => {
        const categories = await getCategoriesFromGit();
        console.log('Categories from git', JSON.stringify(categories));
        expect(categories?.length).toBeGreaterThan(0);
    })

});