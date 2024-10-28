import { FlatList, Alert, Button, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import ScreenWrapper from '../../components/ScreenWrapper';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Icon from '../../assets/icons';
import Avatar from '../../components/Avatar';
import { useRouter } from 'expo-router';
import { fetchPosts } from '../../services/postService';
import PostCard from '../../components/PostCard';
import Loading from '../../components/Loading';
import { getUserData } from '../../services/userService';

var limit = 0;

const Home = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState();
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [notificationCount, setNotificationsCount] = useState(0);

   const handlePostEvent = async (payload) => {
    console.log('got post event', payload);

    if (payload.eventType == 'INSERT' && payload?.new?.id) {
        let newPost = { ...payload.new };
        let res = await getUserData(newPost.userId);

        // Verificar que se obtuvieron los datos del usuario correctamente
        newPost.user = res.success? res.data: {};
        // Actualiza el estado de los posts con el nuevo post
        
    }
};



    const handleLikeEvent = async (payload) => {
        console.log("Like event received:", payload); // Log para depuración

        if (payload.eventType === 'INSERT') {
            // Cuando se añade un nuevo like
            setPosts(prevPosts => {
                return prevPosts.map(post => {
                    if (post.id === payload.new.postId) {
                        return {
                            ...post,
                            postLikes: [...post.postLikes, payload.new],
                            likeCount: post.likeCount ? post.likeCount + 1 : 1 // Actualiza el contador de likes
                        };
                    }
                    return post;
                });
            });
        } else if (payload.eventType === 'DELETE') {
            // Cuando se elimina un like
            setPosts(prevPosts => {
                return prevPosts.map(post => {
                    if (post.id === payload.old.postId) {
                        return {
                            ...post,
                            postLikes: post.postLikes.filter(like => like.userId !== payload.old.userId),
                            likeCount: post.likeCount ? post.likeCount - 1 : 0 // Actualiza el contador de likes
                        };
                    }
                    return post;
                });
            });
        }
    };

    const handleNewNotification = async (payload) => {
        console.log('got new notification', payload); // Log para depuración
        if (payload.eventType === 'INSERT' && payload.new.id) {
            setNotificationsCount(prev => prev + 1);
        }
    };

    useEffect(() => {
         if (!user) return; // Verifica si el usuario está disponible antes de suscribirte

        let postChannel = supabase
            .channel('posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, handlePostEvent)
            .subscribe();

            getPosts();

        const notificationChannel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `receiverId=eq.${user.id}`
            }, handleNewNotification)
            .subscribe();

        return () => {
            supabase.removeChannel(postChannel);
            supabase.removeChannel(notificationChannel);
        };
    }, [user]);

    const getPosts = async () => {
        if (!hasMore) return
        limit += 4;
        let res = await fetchPosts(limit);
        if (res.success) {
            if (posts.length === res.data.length) setHasMore(false);
            setPosts(res.data);
        }
    };

    return (
        <ScreenWrapper bg="white">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Ecosistem</Text>
                    <View style={styles.icons}>
                        <Pressable onPress={() => router.push('maps')}>
                            <Icon name="maps" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
                        </Pressable>
                        <Pressable onPress={() => router.push('notifications')}>
                            <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
                            {notificationCount > 0 && (
                                <View style={styles.pill}>
                                    <Text style={styles.pillText}>{notificationCount}</Text>
                                </View>
                            )}
                        </Pressable>
                        <Pressable onPress={() => router.push('newPost')}>
                            <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
                        </Pressable>
                        <Pressable onPress={() => router.push('contactsScreen')}>
                            <Icon name="chat" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
                        </Pressable>
                        <Pressable onPress={() => router.push('profile')}>
                            <Avatar uri={user?.image} size={hp(4.3)} rounded={theme.radius.sm} style={{ borderWidth: 2 }} />
                        </Pressable>
                    </View>
                    
                </View>
                            {/*posts */}
                <FlatList
                    data={posts}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listStyle}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => <PostCard
                     item={item} 
                     currentUser={user} 
                     router={router} 
                     />
                    }
                    onEndReached={getPosts}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={hasMore ? (
                        <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
                            <Loading />
                        </View>
                    ) : (
                        <View style={{ marginVertical: 30 }}>
                            <Text style={styles.noPosts}>No more posts</Text>
                        </View>
                    )}
                />
            </View>
        </ScreenWrapper>
    );
};

// ... código del componente Home ...

// Cierra el componente aquí
export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginHorizontal: wp(4),
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(3.2),
        fontWeight: theme.fonts.bold,
    },
    icons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 18,
    },
    listStyle: {
        paddingTop: 20,
        paddingHorizontal: wp(4),
    },
    noPosts: {
        fontSize: hp(2),
        textAlign: 'center',
        color: theme.colors.text,
    },
    pill: {
        position: 'absolute',
        right: -10,
        top: -4,
        height: hp(2),
        width: hp(2.2),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: theme.colors.roseLight,
    },
    pillText: {
        color: 'white',
        fontSize: hp(1.2),
        fontWeight: theme.fonts.bold,
    },
});
