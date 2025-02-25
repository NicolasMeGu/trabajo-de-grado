import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { theme } from '../constants/theme'
import { hp, stripHtmlTags, wp } from '../helpers/common'
import Avatar from './Avatar'
import moment from 'moment'
import Icon from '../assets/icons'
import RenderHTML from 'react-native-render-html';
import { Image } from 'expo-image'
import { downloadFile, getSupabaseFileUrl } from '../services/imageService'
import { Video } from 'expo-av'
import { TouchableOpacity } from 'react-native'
import { createPostLike, removePostLike } from '../services/postService'
import { Share } from 'react-native'
import Loading from './Loading'

const textStyles = {
    div: {
        color: theme.colors.dark,
        fontSize: hp(1.75)
    }
}

const tagsStyles = {
    div: textStyles,
    p: textStyles,
    ol: textStyles,
    h1: {
        color: theme.colors.dark
    },
    h4: {
        color: theme.colors.dark
    }
}

const PostCard = ({
    item,
    currentUser,
    router,
    hasShadow = true,
    showMoreIcon = true,
    showDelete = false,
    onDelete = () => { },
    onEdit = () => { }
}) => {

    const shadowStyles = {
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.86,
        shadowRadius: 6,
        elevation: 1
    }

    const [loading, setLoading] = useState(false);
    const [likes, setLikes] = useState(item?.postLikes || []);
    const [showMore, setShowMore] = useState(false);
const [isLongText, setIsLongText] = useState(false);

useEffect(() => {
    if (item?.body) {
        const plainText = stripHtmlTags(item?.body);
        setIsLongText(plainText.length > 200);
    }
}, [item?.body]);

const toggleShowMore = () => {
    setShowMore(!showMore);
};


    useEffect(() => {
        setLikes(item?.postLikes || []);
    }, [item?.postLikes]);

    const openPostDetails = () => {
        if (!showMoreIcon) return null;
        router.push({ pathname: 'postDetails', params: { postId: item?.id } })
    }

    const onLike = async () => {


        if (liked) {
            // Remove like
            let updatedLikes = likes.filter(like => like.userId !== currentUser?.id);
            setLikes([...updatedLikes]);

            let res = await removePostLike(item?.id, currentUser?.id);
            console.log('removed likes : ', res);
            if (!res.success) {
                Alert.alert('Post', 'Something went wrong!');
            }
        } else {
            // Create like
            const data = {
                userId: currentUser?.id,
                postId: item?.id
            };
            updatedLikes = [...likes, data];
            setLikes(updatedLikes);

            const res = await createPostLike(data);
            console.log('add likes: ', res);
            if (!res.success) {
                Alert.alert('Post', 'Something went wrong!');
            }
        }
    }

    const onShare = async () => {
        let content = { message: stripHtmlTags(item?.body) };
        if (item?.file) {
            setLoading(true);
            let url = await downloadFile(getSupabaseFileUrl(item?.file).uri);
            setLoading(false);
            content.url = url;
        }
        Share.share(content);
    }

    const handlePostDelete = () => {
        Alert.alert('Confirm', "Are you sure you want to do this?", [
            {
                text: 'Cancel',
                onPress: () => console.log('cancelled'),
                style: 'cancel'
            },
            {
                text: 'Delete',
                onPress: () => onDelete(item),
                style: 'destructive'
            }
        ])
    }

    const createdAt = moment(item?.created_at).format('MMM D');

    const liked = likes.some(like => like.userId === currentUser?.id);

    return (
        <View style={[styles.container, hasShadow && shadowStyles]}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Avatar
                        size={hp(4.5)}
                        uri={item?.user?.image}
                        rounded={theme.radius.md}
                    />
                    <View style={{ gap: 2 }}>
                        <Text style={styles.username}>
                            {item?.user?.name}
                        </Text>
                        <Text style={styles.postTime}>
                            {createdAt}
                        </Text>
                    </View>
                </View>

                {showMoreIcon && (
                    <TouchableOpacity onPress={openPostDetails}>
                        <Icon name="dots" size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
                    </TouchableOpacity>
                )}
                {showDelete && currentUser.id === item?.userId && (
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => onEdit(item)}>
                            <Icon name="edit" size={hp(2.4)} color={theme.colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlePostDelete}>
                            <Icon name="delete" size={hp(2.4)} color={theme.colors.rose} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.postBody}>
                   {
    item?.body && (
        <>
            <RenderHTML
                contentWidth={wp(100)}
                source={{ html: showMore || !isLongText ? item?.body : `${stripHtmlTags(item?.body).slice(0, 200)}...` }}
                tagsStyles={tagsStyles}
            />
            {isLongText && (
                <TouchableOpacity onPress={toggleShowMore}>
                    <Text style={{ color: theme.colors.primary }}>
                        {showMore ? 'Show Less' : 'Show More'}
                    </Text>
                </TouchableOpacity>
            )}
        </>
    )
}

                </View>
                {item?.file && item?.file.includes('postImages') && (
                    <Image
                        source={getSupabaseFileUrl(item?.file)}
                        transition={100}
                        style={styles.postMedia}
                        contentFit='cover'
                    />
                )}
                {item?.file && item?.file.includes('postVideos') && (
                    <Video
                        style={[styles.postMedia, { height: hp(30) }]}
                        source={getSupabaseFileUrl(item?.file)}
                        useNativeControls
                        contentFit='cover'
                        isLooping
                    />
                )}
            </View>

            <View style={styles.footer}>
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={onLike}>
                        <Icon name="heart" size={24} fill={liked? theme.colors.rose : 'transparent'} color={liked ? theme.colors.rose : theme.colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.count}>
                        {likes.length}
                    </Text>
                </View>

                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={openPostDetails}>
                        <Icon name="comment" size={24} color={theme.colors.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.count}>
                        {item?.comments[0]?.count}
                    </Text>
                </View>

                <View style={styles.footerButton}>
                    {loading ? (
                        <Loading size="small" />
                    ) : (
                        <TouchableOpacity onPress={onShare}>
                            <Icon name="share" size={24} color={theme.colors.textLight} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    )
}

export default PostCard

const styles = StyleSheet.create({
    count: {
        color: theme.colors.text,
        fontSize: hp(1.8)
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },
    footerButton: {
        marginLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    postBody: {
        marginLeft: 5,
    },
    postMedia: {
        height: hp(40),
        width: '100%',
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous'
    },
    content: {
        gap: 10,
    },
    postTime: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontWeight: theme.fonts.medium
    },
    username: {
        fontSize: hp(1.7),
        color: theme.colors.textDark,
        fontWeight: theme.fonts.medium,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    container: {
        gap: 10,
        marginBottom: 15,
        borderRadius: theme.radius.xxl * 2,
        borderCurve: 'continuous',
        padding: 10,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: theme.colors.gray,
        shadowColor: '#000'
    }
})
