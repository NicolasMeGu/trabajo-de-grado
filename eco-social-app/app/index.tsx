import { View, Text } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';  // Asegúrate de que ScreenWrapper esté en el directorio adecuado.
import Loading from '../components/Loading';  // Asegúrate de que Loading esté en el directorio adecuado.

const Index = () => {
    const router = useRouter();  // Si no estás usando `router`, puedes eliminar esta línea.

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Loading /> 
        </View>
    );
};

export default Index;
