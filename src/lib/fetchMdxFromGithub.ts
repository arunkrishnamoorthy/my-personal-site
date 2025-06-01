const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';
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
