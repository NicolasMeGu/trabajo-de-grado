import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { wp,hp } from '../../helpers/common';
import { theme } from '../../constants/theme';


const FormMaps = () => {
    const [projectType, setProjectType] = useState('');
    const [product, setProduct] = useState('');

    const handleSubmit = () => {
        // Aquí puedes manejar el envío de los datos, por ejemplo, almacenándolos o enviándolos a tu API
        console.log('Proyecto:', projectType);
        console.log('Producto:', product);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>¿En qué proyecto participas?</Text>
            <Picker
                selectedValue={projectType}
                style={styles.picker}
                onValueChange={(itemValue) => setProjectType(itemValue)}
            >
                <Picker.Item label="Selecciona un proyecto" value="" />
                <Picker.Item label="Huerto" value="huerto" />
                <Picker.Item label="Animales" value="animales" />
                <Picker.Item label="Reciclaje" value="reciclaje" />
            </Picker>

            {projectType === 'huerto' && (
                <TextInput
                    style={styles.input}
                    placeholder="Ejemplo: frutas, verduras"
                    onChangeText={setProduct}
                />
            )}
            {projectType === 'animales' && (
                <TextInput
                    style={styles.input}
                    placeholder="Ejemplo: carnes, fertilizantes"
                    onChangeText={setProduct}
                />
            )}
            {projectType === 'reciclaje' && (
                <TextInput
                    style={styles.input}
                    placeholder="Ejemplo: plástico, papel"
                    onChangeText={setProduct}
                />
            )}

            <Button title="Enviar" onPress={handleSubmit} />
        </View>
    );
};

export default FormMaps;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: wp(7),
    },
    label: {
        fontSize: hp(2.5), // Ajusta el tamaño según tu tema
        color: theme.colors.text,
        fontWeight: theme.fonts.medium,
        marginBottom: 8,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 16,
        borderColor: theme.colors.primary, // O usa el color que necesites
        borderWidth: 1,
        borderRadius: theme.radius.sm, // Ajusta según tu tema
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        borderRadius: theme.radius.sm, // Ajusta según tu tema
    },
});
