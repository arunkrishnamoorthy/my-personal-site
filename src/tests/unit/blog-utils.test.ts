import path from "node:path";
import * as utils from "@/app/blog/utils";

describe("utils.ts", () => {
    console.log(`Current working directory`, process.cwd());
    const testDirectory = path.join(process.cwd(), "src", "app", "blog", "contents");
    const testFilePath = path.join(testDirectory, "vim.mdx");

    beforeAll(() => {
        console.log(`Making a new directory`);
        // if the directory does not exists, create a new directory and a test file. 
        // if(!fs.existsSync(testDirectory)){
        //     fs.mkdirSync(testDirectory, { recursive: true })
        //     fs.writeFileSync(testFilePath, `---\ntitle: "Test Post"\ndate: "2023-10-01"\n---\n# Test Content`);
        // }
        
    });

    afterAll(() => {
        // cleanup 
        // fs.unlinkSync(testFilePath);
        // fs.rmdirSync(testDirectory);
    });

    test("getMDXfiles returns .mdx files", () => {
        const files = utils.getMDXFiles(testDirectory);
        console.log("MDX files found", files);
        expect(files).toContain("vim.mdx");
    });

    test("readMDXfiles returns raw contents", () => {
        console.log(testFilePath);
        const result = utils.readMDXfile(testFilePath);
        expect(result).toHaveProperty("data");
        expect(result).toHaveProperty("content");
    });

    test("getMDXData for all files", () => {
        const result = utils.getMDXData(testDirectory);
        expect(result).toHaveLength(5);
        expect(result[0]).toHaveProperty("metadata");
        expect(result[0]).toHaveProperty("slug");
    });

    test("getBlogPosts functions to return all blogs", () => {
        const result = utils.getBlogPosts();
        expect(result).toHaveLength(5);
        expect(result[0]).toHaveProperty("metadata");
        expect(result[0]).toHaveProperty("slug");
    });

    /** 
     * jest uses test and it for individual test cases. There are no difference. 
     * it provides BDD(behaviour driven development) style making test read sentances like \
     * it("shoud call the format function ")
     */
    it("should call format date function without relative and return date string" , () => {
        const date = new Date();
        const dateString = date.toISOString().split("T")[0];
        const formattedDate = utils.formatDate(dateString);
        expect(typeof formattedDate).toBe("string");
        expect(formattedDate).toMatch(/\d{4}/)
    });

    it("should call formatDate function with includeRelative and return relative date", () => {
        const date = new Date();
        const dateString = date.toISOString().split("T")[0];
        const formattedDate = utils.formatDate(dateString,true);
        console.log(formattedDate);
        expect(formattedDate).toMatch(/ago/);
        expect(formattedDate).toMatch(/\(.+\)/)
    });

});


