import {Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import {  StatusBar } from 'react-native-web'
import  {wp,hp} from '../helpers/common'
import {theme } from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'


const Welcome = () => {
    const router = useRouter();
     
  return (
  
    <ScreenWrapper bg="white">
        <StatusBar style="dark"/>
        <View style={styles.container}>
            {/* welcome image */}
            <Image style={styles.welcomeImage} resizeMode='contain' source={require('../assets/images/welcome.png')}/>
            {/*title*/}
            <View style={{gap:20}}>
                <Text style={styles.title}>¡Bienvenido a Ecosistem! 🌱🌍</Text>
                <Text style={styles.punchline}>¡Juntos podemos construir un futuro más verde y sostenible! 🌿</Text>
            </View>
            {/* Footer */}
            <View style={styles.footer}>
                <Button 
                    title="Empezar"
                    buttonStyle={{marginHorizontal:wp(3)}}
                    onPress={() => router.push('singUp')}
                />
            </View>
            <View style={styles.bottomTextContainer}>
                <Text style={styles.loginText}>
                    Ya tengo una cuenta! 
                </Text>
                <Pressable onPress={()=> router.push('login')}>
                    <Text style={[styles.loginText,{color: 'blue', fontWeight: theme.fonts.semibold}]}>
                        Iniciar Sesion
                    </Text>
                </Pressable>

            </View>

        </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems:'center',
        justifyContent:'space-around',
        backgroundColor:'#024208',
        marginHorizontal:wp(0)

    },
    welcomeImage:{
        height: hp(40),
        width: wp(80),
        alignSelf: 'center',
    },
    title:{
        color: 'white',
        fontSize:hp(5),
        textAlign:'center',
        fontWeight: theme.fonts.extraBold
    },
    punchline:{
        textAlign: 'center',
        paddingHorizontal: wp(10),
        fontSize: hp(2.7),
        color: 'white'

    },
    footer:{
        gap:30,
        width:'100%'
    },
    bottomTextContainer:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        gap:5
    },
    loginText:{
        textAlign:'center',
        color:'white',
        fontSize: hp(2)
    }
})