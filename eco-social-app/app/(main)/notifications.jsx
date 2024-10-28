import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchNotifications } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useRouter } from 'expo-router';
import NotificationItem from '../../components/NotificationItem';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Header from '../../components/Header';



const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getNotifications();
  },[]);

  const getNotifications = async () => {
    let res = await fetchNotifications(user.id);
    console.log('notifications ', res);
    if(res.success) setNotifications(res.data);
  }
  return (
    <ScreenWrapper>
      <Header title="Notificaciones"/>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainer={styles.listStyle}>
          {
            notifications.map(item => {
              return (
                <NotificationItem
                  item={item}
                  key={item?.id}
                  router={router}
                />
              )
            })
          }
          {
            notifications.length == 0 && (
              <Text style={styles.noData}>
                no tienes notificaciones 
              </Text>
            )
          }

        </ScrollView>


      </View>
      <Text>notifications</Text>
    </ScreenWrapper>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),

  },
  listStyle: {
    paddingVertical: 20,
    gap: 10
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: 'center',  // La propiedad correcta es 'textAlign', no 'textAling'
  },

})