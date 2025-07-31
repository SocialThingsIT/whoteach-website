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
import type { Post } from '~/types';
import { db } from '~/utils/firebase';

//TODO delete

function parseMarkdownToPost(docData: any, docId: string): Post {
    const { content, metadata } = docData;

    return {
        id: docId,
        slug: metadata.slug || docId,
        permalink: metadata.permalink || `/${metadata.slug || docId}`,
        publishDate: metadata.publishDate || metadata.date || new Date(),
        updateDate: metadata.updateDate,
        title: metadata.title || 'Untitled',
        excerpt: metadata.excerpt || metadata.description || '',
        image: metadata.image,
        category: metadata.category
            ? {
                slug: metadata.category.toLowerCase().replace(/\s+/g, '-'),
                title: metadata.category,
            }
            : undefined,
        tags: metadata.tags || [],
        author: metadata.author,
        draft: metadata.draft || false,
        content: content,
        readingTime: Math.ceil((content || '').split(' ').length / 200),
    };
}

export async function getPostsFromFirestore(postsPerPage: number = 10, pageNumber: number = 1) {
    try {
        const postsRef = collection(db, 'posts');
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
        const posts: Post[] = [];
        const hasNextPage = querySnapshot.docs.length > postsPerPage;

        querySnapshot.docs.slice(0, postsPerPage).forEach((doc) => {
            const post = parseMarkdownToPost(doc.data(), doc.id);
            if (!post.draft) {
                posts.push(post);
            }
        });

        return {
            posts,
            hasNextPage,
            hasPrevPage: pageNumber > 1,
            currentPage: pageNumber,
            totalPages: null,
        };
    } catch (error) {
        console.error('Error fetching posts from Firestore:', error);
        return {
            posts: [],
            hasNextPage: false,
            hasPrevPage: false,
            currentPage: 1,
            totalPages: 1,
        };
    }
}

export async function getPostBySlugFromFirestore(slug: string): Promise<Post | null> {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('metadata.slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return parseMarkdownToPost(doc.data(), doc.id);
        }

        const docRef = doc(db, 'posts', slug);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return parseMarkdownToPost(docSnap.data(), docSnap.id);
        }

        return null;
    } catch (error) {
        console.error('Error fetching post by slug from Firestore:', error);
        return null;
    }
}

export async function getTotalPostsCount(): Promise<number> {
    try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('metadata.draft', '!=', true));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error getting total posts count:', error);
        return 0;
    }
}

export function getFirestoreStaticPaths({ paginate }: { paginate: Function }) {
    return async () => {
        const postsPerPage = 10;
        const totalPosts = await getTotalPostsCount();
        const totalPages = Math.ceil(totalPosts / postsPerPage);

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            const { posts, hasNextPage, hasPrevPage } = await getPostsFromFirestore(postsPerPage, i);

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
}

export const blogListRobots = {
    index: true,
    follow: true,
};