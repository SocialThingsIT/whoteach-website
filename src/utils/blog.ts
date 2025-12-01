import type { PaginateFunction } from 'astro';
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Post } from '~/types';
import { APP_BLOG } from 'astrowind:config';
import { cleanSlug, trimSlash, BLOG_BASE, POST_PERMALINK_PATTERN, CATEGORY_BASE, TAG_BASE } from './permalinks';

const generatePermalink = async ({
  id,
  slug,
  publishDate,
  category,
  lang = 'it',
}: {
  id: string;
  slug: string;
  publishDate: Date;
  category: string | undefined;
  lang?: string;
}) => {
  const year = String(publishDate.getFullYear()).padStart(4, '0');
  const month = String(publishDate.getMonth() + 1).padStart(2, '0');
  const day = String(publishDate.getDate()).padStart(2, '0');
  const hour = String(publishDate.getHours()).padStart(2, '0');
  const minute = String(publishDate.getMinutes()).padStart(2, '0');
  const second = String(publishDate.getSeconds()).padStart(2, '0');

  const permalink = POST_PERMALINK_PATTERN.replace('%slug%', slug)
    .replace('%id%', id)
    .replace('%category%', category || '')
    .replace('%year%', year)
    .replace('%month%', month)
    .replace('%day%', day)
    .replace('%hour%', hour)
    .replace('%minute%', minute)
    .replace('%second%', second);

  // NON aggiungere lang qui - sarà aggiunto dall'URL della pagina
  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
};

const getNormalizedPost = async (post: CollectionEntry<'post'>, lang = 'it'): Promise<Post> => {
  const { id, data } = post;
  const { Content, remarkPluginFrontmatter } = await render(post);

  const {
    publishDate: rawPublishDate = new Date(),
    updateDate: rawUpdateDate,
    title,
    excerpt,
    image,
    tags: rawTags = [],
    category: rawCategory,
    author,
    draft = false,
    metadata = {},
  } = data;

  // Rimuovi il prefisso lingua dall'ID
  const cleanId = id.replace(`${lang}/`, ''); // "it/post-1.md" -> "post-1.md"
  const slug = cleanSlug(cleanId);
  const publishDate = new Date(rawPublishDate);
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;

  const category = rawCategory
    ? {
        slug: cleanSlug(rawCategory),
        title: rawCategory,
      }
    : undefined;

  const tags = rawTags.map((tag: string) => ({
    slug: cleanSlug(tag),
    title: tag,
  }));

  console.log(
    'Post permalink:',
    await generatePermalink({ id: cleanId, slug, publishDate, category: category?.slug, lang })
  ); // DEBUG

  return {
    id: id,
    slug: slug,
    permalink: await generatePermalink({ id: cleanId, slug, publishDate, category: category?.slug, lang }),

    publishDate: publishDate,
    updateDate: updateDate,

    title: title,
    excerpt: excerpt,
    image: image,

    category: category,
    tags: tags,
    author: author,

    draft: draft,

    metadata,

    Content: Content,

    readingTime: remarkPluginFrontmatter?.readingTime,
  };
};

const load = async function (lang = 'it'): Promise<Array<Post>> {
  const posts = await getCollection('post', ({ id }) => {
    console.log('Post ID:', id, 'Lang:', lang, 'Starts with:', id.startsWith(`${lang}/`)); // DEBUG
    return id.startsWith(`${lang}/`);
  });

  console.log('Loaded posts for', lang, ':', posts.length); // DEBUG

  const normalizedPosts = posts.map(async (post) => await getNormalizedPost(post, lang));

  const results = (await Promise.all(normalizedPosts))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    .filter((post) => !post.draft);

  return results;
};

const _posts: Record<string, Array<Post>> = {};

/** */
export const isBlogEnabled = APP_BLOG.isEnabled;
export const isRelatedPostsEnabled = APP_BLOG.isRelatedPostsEnabled;
export const isBlogListRouteEnabled = APP_BLOG.list.isEnabled;
export const isBlogPostRouteEnabled = APP_BLOG.post.isEnabled;
export const isBlogCategoryRouteEnabled = APP_BLOG.category.isEnabled;
export const isBlogTagRouteEnabled = APP_BLOG.tag.isEnabled;

export const blogListRobots = APP_BLOG.list.robots;
export const blogPostRobots = APP_BLOG.post.robots;
export const blogCategoryRobots = APP_BLOG.category.robots;
export const blogTagRobots = APP_BLOG.tag.robots;

export const blogPostsPerPage = APP_BLOG?.postsPerPage;

/** */
export const fetchPosts = async (lang = 'it'): Promise<Array<Post>> => {
  // AGGIUNGI: parametro lang
  if (!_posts[lang]) {
    // MODIFICA: controlla per lingua
    _posts[lang] = await load(lang); // MODIFICA: carica per lingua
  }

  return _posts[lang]; // MODIFICA: ritorna per lingua
};

export const findPostsBySlugs = async (slugs: Array<string>, lang = 'it'): Promise<Array<Post>> => {
  // AGGIUNGI: parametro lang
  if (!Array.isArray(slugs)) return [];

  const posts = await fetchPosts(lang); // AGGIUNGI: passa lang

  return slugs.reduce(function (r: Array<Post>, slug: string) {
    posts.some(function (post: Post) {
      return slug === post.slug && r.push(post);
    });
    return r;
  }, []);
};

export const findPostsByIds = async (ids: Array<string>, lang = 'it'): Promise<Array<Post>> => {
  // AGGIUNGI: parametro lang
  if (!Array.isArray(ids)) return [];

  const posts = await fetchPosts(lang); // AGGIUNGI: passa lang

  return ids.reduce(function (r: Array<Post>, id: string) {
    posts.some(function (post: Post) {
      return id === post.id && r.push(post);
    });
    return r;
  }, []);
};

export const findLatestPosts = async ({
  count,
  lang = 'it',
}: {
  count?: number;
  lang?: string;
}): Promise<Array<Post>> => {
  // AGGIUNGI: lang nei parametri
  const _count = count || 4;
  const posts = await fetchPosts(lang); // AGGIUNGI: passa lang

  return posts ? posts.slice(0, _count) : [];
};

/** */
export const getStaticPathsBlogList = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogListRouteEnabled) return [];

  const langs = ['it', 'en'];
  const allPaths: any[] = [];

  for (const lang of langs) {
    const posts = await fetchPosts(lang);
    const paths = paginate(posts, {
      params: { lang, blog: BLOG_BASE || undefined },
      pageSize: blogPostsPerPage,
    });
    allPaths.push(...paths);
  }

  return allPaths;
};

/** */
export const getStaticPathsBlogPost = async () => {
  if (!isBlogEnabled || !isBlogPostRouteEnabled) return [];

  const langs = ['it', 'en'];
  const allPaths: any[] = [];

  for (const lang of langs) {
    const posts = await fetchPosts(lang);
    const paths = posts.map((post) => ({
      params: {
        lang,
        blog: post.permalink,
      },
      props: { post },
    }));
    allPaths.push(...paths);
  }

  return allPaths;
};

/** */
export const getStaticPathsBlogCategory = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogCategoryRouteEnabled) return [];

  const langs = ['it', 'en'];
  const allPaths: any[] = [];

  for (const lang of langs) {
    const posts = await fetchPosts(lang);
    const categories: Record<string, any> = {};

    posts.forEach((post) => {
      if (post.category?.slug) {
        categories[post.category.slug] = post.category;
      }
    });

    const paths = Array.from(Object.keys(categories)).flatMap((categorySlug) =>
      paginate(
        posts.filter((post) => post.category?.slug && categorySlug === post.category?.slug),
        {
          params: { lang, category: categorySlug, blog: CATEGORY_BASE || undefined },
          pageSize: blogPostsPerPage,
          props: { category: categories[categorySlug] },
        }
      )
    );

    allPaths.push(...paths);
  }

  return allPaths;
};

/** */
export const getStaticPathsBlogTag = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogTagRouteEnabled) return [];

  const langs = ['it', 'en'];
  const allPaths: any[] = [];

  for (const lang of langs) {
    const posts = await fetchPosts(lang);
    const tags: Record<string, any> = {};

    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          tags[tag.slug] = tag;
        });
      }
    });

    const paths = Array.from(Object.keys(tags)).flatMap((tagSlug) =>
      paginate(
        posts.filter((post) => Array.isArray(post.tags) && post.tags.find((elem) => elem.slug === tagSlug)),
        {
          params: { lang, tag: tagSlug, blog: TAG_BASE || undefined },
          pageSize: blogPostsPerPage,
          props: { tag: tags[tagSlug] },
        }
      )
    );

    allPaths.push(...paths);
  }

  return allPaths;
};

/** */
export async function getRelatedPosts(originalPost: Post, maxResults: number = 4, lang = 'it'): Promise<Post[]> {
  const allPosts = await fetchPosts(lang); // AGGIUNGI: passa lang
  const originalTagsSet = new Set(originalPost.tags ? originalPost.tags.map((tag) => tag.slug) : []);

  const postsWithScores = allPosts.reduce((acc: { post: Post; score: number }[], iteratedPost: Post) => {
    if (iteratedPost.slug === originalPost.slug) return acc;

    let score = 0;
    if (iteratedPost.category && originalPost.category && iteratedPost.category.slug === originalPost.category.slug) {
      score += 5;
    }

    if (iteratedPost.tags) {
      iteratedPost.tags.forEach((tag) => {
        if (originalTagsSet.has(tag.slug)) {
          score += 1;
        }
      });
    }

    acc.push({ post: iteratedPost, score });
    return acc;
  }, []);

  postsWithScores.sort((a, b) => b.score - a.score);

  const selectedPosts: Post[] = [];
  let i = 0;
  while (selectedPosts.length < maxResults && i < postsWithScores.length) {
    selectedPosts.push(postsWithScores[i].post);
    i++;
  }

  return selectedPosts;
}
