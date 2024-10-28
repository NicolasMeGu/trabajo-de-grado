import { Alert,Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import Icon from '../assets/icons'
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import {useRouter} from 'expo-router'
import {wp,hp} from '../helpers/common'
import Input from '../components/Input'
import Button from '../components/Button'
import { useRef,useState } from 'react'
import { supabase } from '../lib/supabase'


const Login = () => {
  const router = useRouter();
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async ()=>{
    if(!emailRef.current || !passwordRef.current){
      Alert.alert('Login',"por favor llena todos los campos");
      return;
    }
    //GOOD TO GO 
    
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({
      email,
      password
    });

    
    if(error){
      Alert.alert('Login',error.message);
    }

  }


  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark"/>
      <View style={styles.container}>
        <BackButton router={router}/>
         {/* welcome image */}
            {/* <Image style={styles.welcomeImage} resizeMode='contain' source={require('../assets/images/welcome.png')}/> */}
        {/*welcome */}
          <View>
            <Text style={styles.welcomeText}>Hey</Text>
            <Text style={styles.welcomeText}>Bienvenido de nuevo!</Text>
          </View>
         {/*form */}
        <View style={styles.form}>
          <Text style={{fontSize:hp(2),color: theme.colors.text}}>
            inicia sesion para continuar
          </Text>
          <Input 
              icon={<Icon name="mail" size={26} strokeWidth={1.6}/>}
              placeholder='enter your email'
              onChangeText={value=> emailRef.current = value}
          />
          <Input 
               icon={<Icon name="lock" size={26} strokeWidth={1.6}/>}
               placeholder='enter your password'
               secureTextEntry
               onChangeText={value=> passwordRef.current = value}
        />
        <Text style={styles.forgotPassword}>
          olvidaste la contraseña?
        </Text>

        {/*button */}
        <Button title={'Login'} loading={loading} onPress={onSubmit}/>
       </View>
       {/* Footer */}

       <View style={[styles.footer]}>
            <Text style={styles.footerText}>
              Dont have an account?
            </Text>
            <Pressable onPress={()=> router.push('singUp')}>
              <Text style={[styles.footerText, {color: theme.colors.primaryDark , fontWeight: theme.fonts.semibold }]}>Registrate</Text>
            </Pressable>
       </View>
      
      </View>

    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container:{
    flex:1,
    gap:45,
    paddingHorizontal:wp(5)

  },
  welcomeImage:{
        height: hp(10),
        width: wp(50),
        alignSelf: 'center',
    },
  welcomeText:{
    fontSize:hp(4),
    fontWeight:theme.fonts.bold,
    color: theme.colors.text,

  },
  form:{
    gap:25,
  },
  forgotPassword:{
    textAling:'right',
    fontWeight: theme.fonts.semibold,
    color:theme.colors.text
  },
  footer:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    gap:5,

  },
  footerText:{
    textAling:'center',
    color: theme.colors.text,
    fontSize:hp(1.6)
  }
})