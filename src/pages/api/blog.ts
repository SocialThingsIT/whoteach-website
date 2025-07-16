// src/pages/api/blog.ts
import type { APIRoute } from 'astro';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { title, description, tags, category, author, image, content } = data;

    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const publishDate = new Date().toISOString();
    const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];

    const frontmatter = {
      title,
      excerpt: description || '',
      publishDate,
      draft: false,
      ...(tagsArray.length > 0 && { tags: tagsArray }),
      ...(category && { category }),
      ...(author && { author }),
      ...(image && { image }),
      metadata: {
        description: description || '',
        ...(title && { title })
      }
    };

    const frontmatterString = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (key === 'publishDate') {
          return `${key}: ${value}`;
        } else if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        } else if (typeof value === 'object') {
          return `${key}:\n  ${Object.entries(value).map(([k, v]) => `${k}: "${v}"`).join('\n  ')}`;
        } else if (typeof value === 'string') {
          return `${key}: "${value}"`;
        } else {
          return `${key}: ${value}`;
        }
      })
      .join('\n');

    const blogPost = `---\n${frontmatterString}\n---\n\n${content}`;

    const contentDir = path.join(process.cwd(), 'src', 'data', 'post');
    if (!existsSync(contentDir)) {
      mkdirSync(contentDir, { recursive: true });
    }

    const filename = `${slug}.md`;
    const filepath = path.join(contentDir, filename);

    writeFileSync(filepath, blogPost, 'utf8');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Blog post created successfully',
        filename,
        slug,
        filepath: `src/data/post/${filename}`
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating blog post:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create blog post' }),
      { status: 500 }
    );
  }
};

export const GET: APIRoute = async () => {
  try {
    const contentDir = path.join(process.cwd(), 'src', 'data', 'post');
    
    if (!existsSync(contentDir)) {
      return new Response(
        JSON.stringify({ posts: [] }),
        { status: 200 }
      );
    }

    const fs = await import('fs');
    const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));
    
    const posts = files.map(file => {
      const filepath = path.join(contentDir, file);
      const content = fs.readFileSync(filepath, 'utf8');
      const slug = file.replace('.md', '');
      
      return {
        slug,
        filename: file,
        lastModified: fs.statSync(filepath).mtime
      };
    });

    return new Response(
      JSON.stringify({ posts }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch blog posts' }),
      { status: 500 }
    );
  }
};