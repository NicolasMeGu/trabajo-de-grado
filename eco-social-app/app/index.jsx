import { Text, Button } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import ScreenWrapper from '../components/ScreenWrapper';
import { View } from 'react-native';
import Loading from '../components/Loading';

const index = () => {
    const router = useRouter();
  return (
    <View style={{flex: 1, alingItems:'center', justifyContent:'center'}}>
      <Loading/>
    </View>
  )
}

export default index