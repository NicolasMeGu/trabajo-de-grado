import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Icon from '../../assets/icons';
import { theme } from '../../constants/theme';
import { wp, hp } from '../../helpers/common';
import { supabase } from '../../lib/supabase'
import  Avatar  from '../../components/Avatar';
import { fetchPosts } from '../../services/postService';
import PostCard from '../../components/PostCard';
import Loading from '../../components/Loading';




var limit = 0;
const Profile = () => {


  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]); // Cambiado de setPost a setPosts
  const [hasMore, SetHasMore] = useState(true);




  const onLogout = async () => {
    //  setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sing out ', "error cerrando sesion")
    }


  }
   const getPosts = async () => {
        // Llamar a la API
        if (!hasMore) return null;
        limit = limit + 4;
       // console.log('fetching post: ', limit);
        let res = await fetchPosts(limit, user.id);
       // console.log('got posts result: ', res);
        if (res.success) {
            if (posts.length == res.data.length) SetHasMore(false);
            setPosts(res.data); // Actualiza los posts en el estado
        }
    }



  const handleLogout = async () => {
    //show confirm modal
    Alert.alert('Confirm', "estas seguro que eseas salir?", [
      {
        text: 'Cancel',
        onPress: () => console.log('cancelado'),
        style: 'cancel'
      },
      {
        text: 'Logout',
        onPress: () => onLogout(),
        style: 'destructive'
      }
    ])
  }


  return (
    <ScreenWrapper bg="white">
      <FlatList
                    data={posts} // Asegúrate de usar la variable posts
                    ListHeaderComponent={ <UserHeader user={user} router={router} handleLogout={handleLogout} />}
                    ListHeaderComponentStyle={{marginBottom:40}}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listStyle}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => <PostCard
                        item={item}
                        currentUser={user}
                        router={router}
                    />
                    }
                    onEndReached={() => {
                        getPosts();
                        console.log('got to the end');
                    }}
                    onEndReachedThreshold={0}
                    ListFooterComponent={hasMore? (
                        <View style={{ marginVertical: posts.length == 0 ? 200 : 30 }}>
                            <Loading />
                        </View>
                    ):(
                        <View style={{ marginVertical: 30 }}>
                            <Text style={styles.noPosts}>No more post</Text>
                        </View>
                    )}
                />
     
    </ScreenWrapper>
  )
}






const UserHeader = ({ user, router, handleLogout }) => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: wp(4) }}>
      <View>
        <Header title="Profile" mb={30} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} >
          <Icon name="logout" color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
          <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl}
            />

            <Pressable style={styles.editIcon} onPress={() => router.push('editProfile')}>
              <Icon name="edit" strokeWidth={2.5} size={20} />
            </Pressable>
          </View>
          {/*nombre y direccion */}
          <View style={{ alingItems: 'center', gap: 4 }}>
            <Text style={styles.userName} > {user && user.name}</Text>
            <Text style={styles.infoText} > {user && user.address}</Text>
          </View>

          {/*email phone and bio */}
          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText} > {user && user.email}</Text>
            </View>
            {
              user && user.phoneNumber && (
                <View style={styles.info}>
                  <Icon name="call" size={20} color={theme.colors.textLight} />
                  <Text style={styles.infoText} > {user && user.phoneNumber}</Text>
                </View>
              )
            }

            {
              user && user.bio && (
                <Text style={styles.infoText} >{user.bio}</Text>
              )
            }




          </View>
        </View>
      </View>


    </View>
  )
}


export default Profile


const styles = StyleSheet.create({
  container: {
    flex: 1,


  },


  HeaderContainer: {
    marginHorizontal: wp(4),
    marginBottom: 20
  },
  headerShapw: {
    width: wp(100),
    height: hp(20)
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center'
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 5,
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7
  },


  userName: {
    fontSize: hp(3),
    fontWeight: '500',
    color: theme.colors.textDark
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: '#074D0E'
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text
  },
})
