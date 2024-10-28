import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

// Crear o actualizar un post
export const createOrUpdatePost = async (post) => {
    try {
        // Subir archivo si existe
        if (post.file && typeof post.file === 'object') {
            let isImage = post.file.type.startsWith('image'); // Verifica si es imagen
            let folderName = isImage ? 'postImages' : 'postVideos';
            let fileResult = await uploadFile(folderName, post?.file?.uri);

            if (fileResult.success) post.file = fileResult.data;
             else {
                return fileResult; // Retorna en caso de error
            }
        }

        const { data, error } = await supabase
            .from('posts')
            .upsert(post)
            .select()
            .single();

        if (error) {
            console.log('createPost error: ', error);
            return { success: false, msg: 'Could not create post' };
        }
        return { success: true, data: data };
    } catch (error) {
        console.log('createPost error: ', error);
        return { success: false, msg: 'Could not create your post' };
    }
};

// Obtener publicaciones
export const fetchPosts = async (limit = 10, userId) => {
    try {
        const query = supabase
            .from('posts')
            .select(`
                *,
                user: users (id, name, image),
                postLikes (*),
                comments (count)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (userId) {
            query.eq('userId', userId);
        }

        const { data, error } = await query;

        if (error) {
            console.log('fetchPost error: ', error);
            return { success: false, msg: 'Could not fetch the posts' };
        }
        return { success: true, data };
    } catch (error) {
        console.log('fetchPost error: ', error);
        return { success: false, msg: 'Could not fetch the posts' };
    }
};

// Crear "like" en post
export const createPostLike = async (postLike) => {
    try {
        const { error } = await supabase
            .from('postLikes')
            .insert(postLike)
            .select()
            .single();

        if (error) {
            console.log('postLike error: ', error);
            return { success: false, msg: 'Could not like the post' };
        }
        return { success: true };
    } catch (error) {
        console.log('postLike error: ', error);
        return { success: false, msg: 'Could not like the post' };
    }
};

// Remover "like" en post
export const removePostLike = async (postId, userId) => {
    try {
        const { error } = await supabase
            .from('postLikes')
            .delete()
            .eq('userId', userId)
            .eq('postId', postId);

        if (error) {
            console.log('removePostLike error: ', error);
            return { success: false, msg: 'Could not remove the like' };
        }
        return { success: true };
    } catch (error) {
        console.log('removePostLike error: ', error);
        return { success: false, msg: 'Could not remove the like' };
    }
};

// Obtener detalles de un post
export const fetchPostDetails = async (postId) => {
    // Verificar si postId es válido
    if (!postId) {
        console.log('fetchPostDetails error: postId is undefined or null');
        return { success: false, msg: 'Invalid post ID' };
    }
    
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                user: users (id, name, image),
                postLikes (*),
                comments (*, user: users(id, name, image))
            `)
            .eq('id', postId)
            .order('created_at', { ascending: false, foreignTable: 'comments' })
            .single();

        if (error) {
            console.log('fetchPostDetails error: ', error);
            return { success: false, msg: 'Could not fetch the post details' };
        }
        return { success: true, data };
    } catch (error) {
        console.log('fetchPostDetails error: ', error);
        return { success: false, msg: 'Could not fetch the post details' };
    }
};


// Crear comentario
export const createComment = async (comment) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert(comment)
            .select()
            .single();

        if (error) {
            console.log('createComment error: ', error);
            return { success: false, msg: 'Could not create comment' };
        }
        return { success: true, data };
    } catch (error) {
        console.log('createComment error: ', error);
        return { success: false, msg: 'Could not create comment' };
    }
};

// Remover comentario
export const removeComment = async (commentId) => {
    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            console.log('removeComment error: ', error);
            return { success: false, msg: 'Could not remove the comment' };
        }
        return { success: true, data: { commentId } };
    } catch (error) {
        console.log('removeComment error: ', error);
        return { success: false, msg: 'Could not remove the comment' };
    }
};

// Remover post
export const removePost = async (postId) => {
    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            console.log('removePost error: ', error);
            return { success: false, msg: 'Could not remove the post' };
        }
        return { success: true, data: { postId } };
    } catch (error) {
        console.log('removePost error: ', error);
        return { success: false, msg: 'Could not remove the post' };
    }
};
