import { LogBox } from 'react-native'
import React, { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { AuthProvider, useAuth} from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserData } from '../services/userService'

LogBox.ignoreLogs([' Warning: TRenderEngineProvider:','Warning: MemoizedTNodeRenderer:','Warning: TNodeChildrenRenderer:','Native style property "div" is not supported and has been ignored.','Warning: TRenderEngineProvider:']);  

const _layout = ()=>{
  return(
    <AuthProvider>
      <MainLayout/>
    </AuthProvider>
  )
}

const MainLayout = () => {
  const {setAuth, setUserData} = useAuth();
  const router = useRouter();

  useEffect(()=>{
    supabase.auth.onAuthStateChange((_event,session)=>{
      console.log('sesion user: ', session?.user?.id)
      if(session){
        //move to home screen
        setAuth(session?.user);
        updateUserData(session?.user, session?.user?.email);
        console.log('auth user: ', session?.user?.email);
        router.replace('/home')
      }else{
        //move to welcome screen
        setAuth(null);
        router.replace('/welcome')
      }
    })
  },[]);
  

  const updateUserData = async (user,email) =>{
    let res = await getUserData(user?.id);
    if(res.success) setUserData({...res.data, email});
  }

  return (
    <Stack
    screenOptions={{
        headerShown: false
    }}
    >
      <Stack.Screen
      name="(main)/postDetails"
      options={{
        presentation:'modal'
      }}
      />
    </Stack>
    
    
  )
}

export default _layout