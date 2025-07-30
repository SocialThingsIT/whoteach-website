import { collection, getDocs, doc, getDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';

export const getBlogPosts = async (limitCount = 10) => {
  try {
    const blogRef = collection(db, 'blog_posts');
    const q = query(
      blogRef, 
      where('published', '==', true),
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, posts };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return { success: false, error: error.message, posts: [] };
  }
};

export const getBlogPost = async (postId) => {
  try {
    const postRef = doc(db, 'blog_posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const postData = postSnap.data();
      
      if (postData.published) {
        return { 
          success: true, 
          post: {
            id: postSnap.id,
            ...postData
          }
        };
      } else {
        return { success: false, error: 'Post non pubblicato', post: null };
      }
    } else {
      return { success: false, error: 'Post non trovato', post: null };
    }
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return { success: false, error: error.message, post: null };
  }
};

export const getBlogCategories = async () => {
  try {
    const categoriesRef = collection(db, 'blog_categories');
    const querySnapshot = await getDocs(categoriesRef);
    const categories = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, categories };
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return { success: false, error: error.message, categories: [] };
  }
};

export const getBlogPostsByCategory = async (categoryId, limitCount = 10) => {
  try {
    const blogRef = collection(db, 'blog_posts');
    const q = query(
      blogRef,
      where('published', '==', true),
      where('category', '==', categoryId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, posts };
  } catch (error) {
    console.error('Error fetching blog posts by category:', error);
    return { success: false, error: error.message, posts: [] };
  }
};

export const searchBlogPosts = async (searchTerm, limitCount = 10) => {
  try {
    const blogRef = collection(db, 'blog_posts');
    const querySnapshot = await getDocs(blogRef);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.published &&
        (data.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         data.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         data.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        posts.push({
          id: doc.id,
          ...data
        });
      }
    });
    
    posts.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
    
    return { 
      success: true, 
      posts: posts.slice(0, limitCount) 
    };
  } catch (error) {
    console.error('Error searching blog posts:', error);
    return { success: false, error: error.message, posts: [] };
  }
};