import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    orderBy,
    limit,
    startAfter,
    where,
} from 'firebase/firestore';
import { db } from './firebase';

const POSTS_COLLECTION = 'posts';
const CATEGORIES_COLLECTION = 'blog_categories';

function parseMarkdownToPost(docData, docId) {
    const { content, metadata } = docData;
    
    const slug = metadata?.slug || 
                 metadata?.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 
                 docId;

    return {
        id: docId,
        slug: slug,
        permalink: metadata?.canonical || `/${slug}`,
        publishDate: metadata?.publishDate ? new Date(metadata.publishDate) : new Date(),
        updateDate: metadata?.updateDate ? new Date(metadata.updateDate) : undefined,
        title: metadata?.title || 'Untitled',
        excerpt: metadata?.excerpt || metadata?.description || '',
        image: metadata?.image,
        category: metadata?.category
            ? {
                slug: metadata.category.toLowerCase().replace(/\s+/g, '-'),
                title: metadata.category,
            }
            : undefined,
        tags: metadata?.tags || [],
        author: metadata?.author,
        draft: metadata?.draft || false,
        published: metadata?.published !== false,
        content: content,
        readingTime: Math.ceil((content || '').split(' ').length / 200),
        createdAt: metadata?.publishDate ? new Date(metadata.publishDate) : new Date(),
    };
}

export const getBlogPosts = async (postsPerPage = 10, pageNumber = 1) => {
    try {
        const postsRef = collection(db, POSTS_COLLECTION);
        const offset = (pageNumber - 1) * postsPerPage;

        let q = query(
            postsRef,
            where('metadata.draft', '!=', true),
            orderBy('metadata.publishDate', 'desc'),
            orderBy('__name__'),
            limit(postsPerPage + 1)
        );

        if (offset > 0) {
            const offsetQuery = query(
                postsRef,
                where('metadata.draft', '!=', true),
                orderBy('metadata.publishDate', 'desc'),
                orderBy('__name__'),
                limit(offset)
            );
            const offsetSnapshot = await getDocs(offsetQuery);
            const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];

            if (lastDoc) {
                q = query(
                    postsRef,
                    where('metadata.draft', '!=', true),
                    orderBy('metadata.publishDate', 'desc'),
                    orderBy('__name__'),
                    startAfter(lastDoc),
                    limit(postsPerPage + 1)
                );
            }
        }

        const querySnapshot = await getDocs(q);
        const posts = [];
        const hasNextPage = querySnapshot.docs.length > postsPerPage;

        querySnapshot.docs.slice(0, postsPerPage).forEach((docSnapshot) => {
            const post = parseMarkdownToPost(docSnapshot.data(), docSnapshot.id);
            if (!post.draft) {
                posts.push(post);
            }
        });

        return {
            success: true,
            posts,
            hasNextPage,
            hasPrevPage: pageNumber > 1,
            currentPage: pageNumber,
            totalPages: null,
        };
    } catch (error) {
        console.error('Error fetching posts:', error);
        return {
            success: false,
            error: error.message,
            posts: [],
            hasNextPage: false,
            hasPrevPage: false,
            currentPage: 1,
            totalPages: 1,
        };
    }
};

export const getBlogPost = async (slugOrId) => {
    try {
        const docRef = doc(db, POSTS_COLLECTION, slugOrId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const post = parseMarkdownToPost(docSnap.data(), docSnap.id);
            
            if (!post.draft && post.published) {
                return { success: true, post };
            } else {
                return { success: false, error: 'Post non pubblicato', post: null };
            }
        }

        const postsRef = collection(db, POSTS_COLLECTION);
        const querySnapshot = await getDocs(postsRef);
        
        for (const docSnapshot of querySnapshot.docs) {
            const post = parseMarkdownToPost(docSnapshot.data(), docSnapshot.id);
            if (post.slug === slugOrId && !post.draft && post.published) {
                return { success: true, post };
            }
        }

        return { success: false, error: 'Post non trovato', post: null };
    } catch (error) {
        console.error('Error fetching post by slug/id:', error);
        return { success: false, error: error.message, post: null };
    }
};

export const getBlogCategories = async () => {
    try {
        const postsRef = collection(db, POSTS_COLLECTION);
        const querySnapshot = await getDocs(postsRef);
        const categoriesMap = new Map();
        
        querySnapshot.forEach((docSnapshot) => {
            const post = parseMarkdownToPost(docSnapshot.data(), docSnapshot.id);
            
            if (!post.draft && post.published && post.category) {
                const categoryKey = post.category.slug;
                if (!categoriesMap.has(categoryKey)) {
                    categoriesMap.set(categoryKey, {
                        id: categoryKey,
                        slug: post.category.slug,
                        title: post.category.title,
                        count: 1
                    });
                } else {
                    categoriesMap.get(categoryKey).count++;
                }
            }
        });
        
        const categories = Array.from(categoriesMap.values())
            .sort((a, b) => b.count - a.count);
        
        return { success: true, categories };
    } catch (error) {
        console.error('Error fetching blog categories:', error);
        return { success: false, error: error.message, categories: [] };
    }
};

export const getBlogPostsByCategory = async (categorySlugOrName, postsPerPage = 10, pageNumber = 1) => {
    try {
        const postsRef = collection(db, POSTS_COLLECTION);
        const querySnapshot = await getDocs(postsRef);
        const allPosts = [];

        querySnapshot.forEach((docSnapshot) => {
            const post = parseMarkdownToPost(docSnapshot.data(), docSnapshot.id);
            if (!post.draft && post.published) {
                allPosts.push(post);
            }
        });

        const filteredPosts = allPosts.filter(post => {
            if (!post.category) return false;
            return post.category.slug === categorySlugOrName || 
                   post.category.title.toLowerCase() === categorySlugOrName.toLowerCase();
        });

        filteredPosts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

        const startIndex = (pageNumber - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
        const hasNextPage = filteredPosts.length > endIndex;

        return {
            success: true,
            posts: paginatedPosts,
            hasNextPage,
            hasPrevPage: pageNumber > 1,
            currentPage: pageNumber,
            totalPosts: filteredPosts.length,
        };
    } catch (error) {
        console.error('Error fetching blog posts by category:', error);
        return { 
            success: false, 
            error: error.message, 
            posts: [],
            hasNextPage: false,
            hasPrevPage: false,
            currentPage: pageNumber,
            totalPosts: 0,
        };
    }
};

export const searchBlogPosts = async (searchTerm, limitCount = 10) => {
    try {
        const postsRef = collection(db, POSTS_COLLECTION);
        const querySnapshot = await getDocs(postsRef);
        const posts = [];
        
        querySnapshot.forEach((docSnapshot) => {
            const post = parseMarkdownToPost(docSnapshot.data(), docSnapshot.id);
            
            if (
                !post.draft &&
                post.published &&
                (post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()))
            ) {
                posts.push(post);
            }
        });
        
        posts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        return { 
            success: true, 
            posts: posts.slice(0, limitCount) 
        };
    } catch (error) {
        console.error('Error searching blog posts:', error);
        return { success: false, error: error.message, posts: [] };
    }
};

export const getTotalPostsCount = async () => {
    try {
        const postsRef = collection(db, POSTS_COLLECTION);
        const q = query(postsRef, where('metadata.draft', '!=', true));
        const querySnapshot = await getDocs(q);
        return { success: true, count: querySnapshot.size };
    } catch (error) {
        console.error('Error getting total posts count:', error);
        return { success: false, error: error.message, count: 0 };
    }
};

export const getStaticPaths = ({ paginate }) => {
    return async () => {
        const postsPerPage = 10;
        const { count: totalPosts } = await getTotalPostsCount();
        const totalPages = Math.ceil(totalPosts / postsPerPage);

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            const { posts, hasNextPage, hasPrevPage } = await getBlogPosts(postsPerPage, i);

            pages.push({
                params: i === 1 ? {} : { page: i.toString() },
                props: {
                    page: {
                        data: posts,
                        currentPage: i,
                        lastPage: totalPages,
                        size: postsPerPage,
                        total: totalPosts,
                        url: {
                            current: i === 1 ? '/blog' : `/blog/${i}`,
                            prev: i > 1 ? (i === 2 ? '/blog' : `/blog/${i - 1}`) : undefined,
                            next: hasNextPage ? `/blog/${i + 1}` : undefined,
                        },
                    },
                },
            });
        }

        return pages;
    };
};

export const blogListRobots = {
    index: true,
    follow: true,
};