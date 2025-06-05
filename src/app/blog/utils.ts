import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";


// Get all the MDX files. 
export function getMDXFiles(directory: string): string[] {
  const files = fs.readdirSync(directory);
  return files.filter(file => path.extname(file).toLowerCase() === ".mdx");
}

// Read data from the files
export function readMDXfile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return matter(rawContent);
}

// Present the MDX data and Metadata
export function getMDXData(directory: string) {
  const files = getMDXFiles(directory);
  return files.map(file => {
    const filePath = path.join(directory, file);
    const { content, data: metadata } = readMDXfile(filePath);
    const slug = path.basename(file, path.extname(file));
    return {
        metadata,
        slug,
        content
    }
  });
}

// Get all the blog posts
export function getBlogPosts() {
  const blogDirectory = path.join(process.cwd(), "src", "app", "blog", "contents");
  return getMDXData(blogDirectory);
}

// Format the date to a human-readable format
export function formatDate(date: string,includeRelative: boolean = false ) {
    const currentDate = new Date();
    if(!date.includes("T")){
        date = `${date}T00:00:00`; 
    }
    const targetDate = new Date(date);
    const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
    const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
    const daysAgo = currentDate.getDate() - targetDate.getDate();
    const hoursAgo = currentDate.getHours() - targetDate.getHours();
    const minutesAgo = currentDate.getMinutes() - targetDate.getMinutes();
    const secondsAgo = currentDate.getSeconds() - targetDate.getSeconds();
    let formattedDate = "";
    if(yearsAgo > 0) {
        formattedDate = `${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago`;
    } else if(monthsAgo > 0) {
        formattedDate = `${monthsAgo} month${monthsAgo > 1 ? "s" : ""} ago`;
    }
    else if(daysAgo > 0) {
        formattedDate = `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
    }
    else if(hoursAgo > 0) {
        formattedDate = `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
    }
    else if(minutesAgo > 0) {
        formattedDate = `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
    }
    else if(secondsAgo > 0) {
        formattedDate = `${secondsAgo} second${secondsAgo > 1 ? "s" : ""} ago`;
    }

    const fullDate = targetDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    if(includeRelative) {
        return `${formattedDate} (${fullDate})`;
    }
    return fullDate;
}

export function getLatestPosts() {
    const posts = getBlogPosts();
    posts.sort((a,b) => {
        if(new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
            return -1;
        }
        return 1;
    })
    // add logic here to get top 5/10 posts - Feat: Improvements
    return posts;
}

export async function serializeMDX(source: string) {
  return compileMDX({
    source,
    options: {
      mdxOptions: {
        rehypePlugins: [
          rehypeRaw,      // Allows HTML in markdown
          rehypeSanitize, // Sanitizes HTML
        ],
      },
    },
    // components: {}, // Optionally pass custom components here
  });
}