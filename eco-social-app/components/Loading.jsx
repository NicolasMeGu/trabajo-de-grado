import { StyleSheet, View } from 'react-native'
import React from 'react'
import { ActivityIndicator } from 'react-native'
import { theme } from '../constants/theme'


const Loading = ({size="large", color=theme.colors.primary}) => {
  return (
    <View style={{justifyContent:'center', alingItems:'center' }}>
      <ActivityIndicator size={size} color={color}/>
    </View>
  )
}

export default Loading

const styles = StyleSheet.create({})