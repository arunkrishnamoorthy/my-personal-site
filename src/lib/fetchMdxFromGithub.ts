const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
const GITHUB_API_REPO = 'https://api.github.com/repos'
const OWNER = 'arunkrishnamoorthy';
const REPO = 'my-personal-site-contents'
const BRANCH = 'main';


export async function fetchMdxContent(slug: string): Promise<string | null> {
    const url = `${GITHUB_RAW_BASE}/${OWNER}/${REPO}/${BRANCH}/posts/${slug}.mdx`;
    try {
        const res = await fetch(url);
        if(!res.ok) {
            throw new Error(`Failed to fetch ${slug}.mdx`);
        }
        return await res.text();
    } catch(error) {
        console.log('Error fetching MDX:', error);
        return null;
    }
}


export async function getCategoriesFromGit() {

// const res = await fetch(url, {
//   headers: {
//     Authorization: `token ${process.env.GITHUB_TOKEN}`,
//   },
// });
    
    const url = `${GITHUB_API_REPO}/${OWNER}/${REPO}/contents/categories?ref=main`;
    try {
        const res = await fetch(url);
        if(!res.ok) {
            throw new Error(`Failed to get the categories list from the repository`);
        }
        const responseData = await res.text()
        const data = JSON.parse(responseData);
        if(Array.isArray(data) && data.length > 0) {
            return data
                    .filter(f => f.type === 'dir')
                    .map(m => m?.name)
        }
        return [];
    } catch(error) {
        console.log('Failed to get categories with exception object', error);
    }
}