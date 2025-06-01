import { fetchMdxContent } from "@/lib/fetchMdxFromGithub";

describe("fetchMdxContent", () => {

    it("fetches MDX content from github", async () => {
        const content = await fetchMdxContent('test');
        console.log(content);
        expect(content).toContain("Efficiency");
    });

});