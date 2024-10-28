import { StyleSheet, Text, View, Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import * as React from 'react';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useEffect, useState } from 'react';
import { createOrUpdateLocation, fetchLocations } from '../../services/mapsService';
import { getUserData } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { Picker } from '@react-native-picker/picker';
import Header from '../../components/Header';
import ScreenWrapper from '../../components/ScreenWrapper';

// Importar imágenes para los marcadores
import appleImage from '../../assets/apple.png'; // Huertos
import meatImage from '../../assets/meat.png';   // Cría de animales
import recyclingImage from '../../assets/recycling.png'; // Reciclaje

const Maps = () => {
    const { user } = useAuth();
    const [origin, setOrigin] = useState(null);
    const [userLocations, setUserLocations] = useState([]);
    const [markerData, setMarkerData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [currentLocationId, setCurrentLocationId] = useState(null);
    const [participa, setParticipa] = useState('');
    const [projectType, setProjectType] = useState('');
    const [producedItems, setProducedItems] = useState('');
    const [producedQuantity, setProducedQuantity] = useState('');
    const [quantityUnit, setQuantityUnit] = useState('kg');
    const [recyclingItems, setRecyclingItems] = useState('');
    const [sellingOption, setSellingOption] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [introText, setIntroText] = useState('¡Gracias por participar! Al involucrarte en proyectos ambientales, no solo contribuyes a cuidar nuestro planeta, sino que también te conviertes en productor de recursos valiosos.');
    const [mapHeight, setMapHeight] = useState('40%');
    const [projects, setProjects] = useState([]); // Lista de proyectos


    useEffect(() => {
        getLocationPermission();
        loadUserLocations();
    }, []);

    const getLocationPermission = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert('Permiso denegado');
            return;
        }
        updateCurrentLocation();
    };

    const updateCurrentLocation = async () => {
        const location = await Location.getCurrentPositionAsync({});
        const current = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            userId: user?.id
        };
        setOrigin(current);
        const res = await createOrUpdateLocation(current);
        if (!res.success) {
            Alert.alert('Error', res.msg);
        }
    };

    const loadUserLocations = async () => {
        const res = await fetchLocations();
        if (res.success) {
            const uniqueLocations = {};
            res.data.forEach(location => {
                uniqueLocations[location.userId] = location;
            });

            const locationsWithNames = await Promise.all(Object.values(uniqueLocations).map(async (location) => {
                const userData = await getUserData(location.userId);
                return {
                    ...location,
                    userName: userData.success ? userData.data.name : 'Usuario desconocido',
                };
            }));

            setUserLocations(locationsWithNames);
        } else {
            Alert.alert('Error', res.msg);
        }
    };

    const handleShowMarker = (location) => {
    // Solo se agregan datos no nulos a la descripción del marcador
    const descriptionParts = [
        location.projectType ? `Proyecto: ${location.projectType}` : '',
        location.producedItems ? `Producción: ${location.producedItems}` : '',
        location.producedQuantity ? `Cantidad: ${location.producedQuantity} ${location.quantityUnit || ''}` : '',
        location.sellingOption ? `Opción: ${location.sellingOption}` : '',
        location.sellingPrice ? `Precio: ${location.sellingPrice}` : ''
    ].filter(part => part); // Filtra cualquier valor vacío

    const dataForMarker = {
        latitude: location.latitude,
        longitude: location.longitude,
        title: location.userName,
        description: descriptionParts.join(', '), // Une las partes válidas con comas
    };

    setMarkerData(dataForMarker);
    setCurrentLocationId(location.id);
    setParticipa('si');
    setProjectType(location.projectType);
    setProducedItems(location.producedItems);
    setProducedQuantity(location.producedQuantity);
    setQuantityUnit(location.quantityUnit);
    setRecyclingItems(location.recyclingItems);
    setSellingOption(location.sellingOption);
    setSellingPrice(location.sellingPrice || '');
    setEditMode(false);
};


    const handleSubmit = async () => {
    if (projectType && producedItems && producedQuantity) {
        try {
            // Captura la ubicación actual solo cuando hay datos válidos
            const location = await Location.getCurrentPositionAsync({});
            const origin = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                userId: user?.id,
            };

            const dataToSubmit = {
                ...origin,
                projectType,
                producedItems,
                producedQuantity,
                quantityUnit,
                sellingOption,
                sellingPrice: sellingOption === 'vender' ? sellingPrice : null,
            };

            // Solo se envía si todos los campos tienen datos válidos
            if (dataToSubmit.projectType && dataToSubmit.producedItems && dataToSubmit.producedQuantity) {
                const existingLocationRes = await fetchLocations();
                const existingLocation = existingLocationRes.data.find(loc => loc.userId === user?.id);

                if (existingLocation) {
                    dataToSubmit.id = existingLocation.id;
                }

                const res = await createOrUpdateLocation(dataToSubmit);
                if (res.success) {
                    handleShowMarker({
                        ...origin,
                        userName: user.name,
                        projectType,
                        producedItems,
                        producedQuantity,
                    });
                    Alert.alert('Éxito', 'Tu información ha sido guardada y se mostrará en el mapa.');
                    setEditMode(false);
                    
                    // Revocar permisos de ubicación
                    await Location.stopLocationUpdatesAsync();
                } else {
                    Alert.alert('Error', res.msg);
                }

                // Limpia la ubicación después de enviarla
                setOrigin(null); // Evita llenado de datos en la base de datos
            } else {
                Alert.alert('Error', 'Por favor completa todos los campos.');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo obtener la ubicación.');
        }
    } else {
        Alert.alert('Error', 'Por favor completa todos los campos.');
    }
};



    const handleAddProject = () => {
        if (projectType && producedItems && producedQuantity) {
            const newProject = {
                projectType,
                producedItems,
                producedQuantity,
                quantityUnit,
                sellingOption,
                sellingPrice: sellingOption === 'vender' ? sellingPrice : null,
            };
            setProjects([...projects, newProject]);
            setProjectType('');
            setProducedItems('');
            setProducedQuantity('');
            setSellingOption('');
            setSellingPrice('');
        } else {
            Alert.alert('Error', 'Por favor completa todos los campos.');
        }
    };

    const handleParticipationChange = (itemValue) => {
        setParticipa(itemValue);
        if (itemValue === 'no') {
            setIntroText('');
            setProjectType('');
            setProducedItems('');
            setProducedQuantity('');
            setRecyclingItems('');
            setSellingOption('');
            setSellingPrice('');
            setMapHeight('80%');
        } else {
            setIntroText('¡Gracias por participar! Al involucrarte en proyectos ambientales, no solo contribuyes a cuidar nuestro planeta, sino que también te conviertes en productor de recursos valiosos.');
            setMapHeight('30%');
        }
    };

    return (
        <ScreenWrapper>
            <Header title="Mapa" />
            <View style={styles.container}>
                <MapView
                    style={[styles.map, { height: mapHeight }]}
                    initialRegion={{
                        latitude: origin?.latitude || 6.2469,
                        longitude: origin?.longitude || -75.5665,
                        latitudeDelta: 0.09,
                        longitudeDelta: 0.04,
                    }}
                    showsUserLocation
                >

                    {userLocations.map((location) => (
                        <Marker
                            key={location.id}
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }}
                            title={location.userName}
                            description={`Proyecto: ${location.projectType}, Producción: ${location.producedItems}`}
                            onPress={() => handleShowMarker(location)}
                            image={
                                location.projectType === 'Cultivos o huertos' ? appleImage :
                                    location.projectType === 'Agricultura regenerativa' ? meatImage :
                                        location.projectType === 'Reciclaje' ? recyclingImage : undefined
                            }
                        />
                    ))}
                </MapView>

                <ScrollView contentContainerStyle={styles.formContainer}>
                    <Text style={styles.header}>¿Participas en proyectos sostenibles?</Text>
                    {introText ? <Text style={styles.introText}>{introText}</Text> : null}

                    <Picker
                        selectedValue={participa}
                        onValueChange={handleParticipationChange}
                        style={styles.picker}
                    >
                        <Picker.Item label="Selecciona una opción" value="" />
                        <Picker.Item label="Sí" value="si" />
                        <Picker.Item label="No" value="no" />
                    </Picker>

                    {participa === 'si' && (
                        <>
                            <Text>Tipo de proyecto</Text>
                            <Picker
                                selectedValue={projectType}
                                onValueChange={(itemValue) => {
                                    setProjectType(itemValue);
                                    setProducedItems('');
                                    setProducedQuantity('');
                                    setRecyclingItems('');
                                    setSellingOption('');
                                    setSellingPrice('');
                                }}
                                style={styles.picker}
                            >
                                <Picker.Item label="Selecciona el proyecto al que participas" value="" />
                                <Picker.Item label="Huertos o cultivos" value="Cultivos o huertos" />
                                <Picker.Item label="Agricultura regenerativa" value="Agricultura regenerativa" />
                                <Picker.Item label="Reciclaje" value="Reciclaje" />
                            </Picker>

                            {projectType === 'Cultivos o huertos' && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Producciones de frutas (ej. manzanas, peras)'
                                        value={producedItems}
                                        onChangeText={setProducedItems}
                                    />
                                    <View style={styles.quantityContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder='Cantidad de producida'
                                            value={producedQuantity}
                                            onChangeText={setProducedQuantity}
                                        />
                                        <Picker
                                            selectedValue={quantityUnit}
                                            onValueChange={(itemValue) => setQuantityUnit(itemValue)}
                                            style={styles.quantityPicker}
                                        >
                                            <Picker.Item label="kg" value="kg" />
                                            <Picker.Item label="unidades" value="unidades" />
                                        </Picker>
                                    </View>
                                </>
                            )}

                            {projectType === 'Agricultura regenerativa' && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Producciones de animales (carnes, huevos)'
                                        value={producedItems}
                                        onChangeText={setProducedItems}
                                    />
                                    <View style={styles.quantityContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder='Cantidad de producida'
                                            value={producedQuantity}
                                            onChangeText={setProducedQuantity}
                                        />
                                        <Picker
                                            selectedValue={quantityUnit}
                                            onValueChange={(itemValue) => setQuantityUnit(itemValue)}
                                            style={styles.quantityPicker}
                                        >
                                            <Picker.Item label="kg" value="kg" />
                                            <Picker.Item label="unidades" value="unidades" />
                                        </Picker>
                                    </View>
                                </>
                            )}

                            {projectType === 'Reciclaje' && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Elementos reciclables (ej. botellas, cartón)'
                                        value={producedItems}
                                        onChangeText={setProducedItems}
                                    />
                                    <View style={styles.quantityContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder='Cantidad de producida'
                                            value={producedQuantity}
                                            onChangeText={setProducedQuantity}
                                        />
                                        <Picker
                                            selectedValue={quantityUnit}
                                            onValueChange={(itemValue) => setQuantityUnit(itemValue)}
                                            style={styles.quantityPicker}
                                        >
                                            <Picker.Item label="kg" value="kg" />
                                            <Picker.Item label="unidades" value="unidades" />
                                        </Picker>
                                    </View>
                                </>
                            )}

                            <Text>Opción de venta</Text>
                            <Picker
                                selectedValue={sellingOption}
                                onValueChange={setSellingOption}
                                style={styles.picker}
                            >
                                <Picker.Item label="Selecciona una opción" value="" />
                                <Picker.Item label="Vender" value="vender" />
                                <Picker.Item label="Donar" value="donar" />
                                <Picker.Item label="Trocar" value="trocar" />
                            </Picker>

                            {sellingOption === 'vender' && (
                                <TextInput
                                    style={styles.input}
                                    placeholder='Precio'
                                    value={sellingPrice}
                                    onChangeText={setSellingPrice}
                                    keyboardType="numeric"
                                />
                            )}

                            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                <Text style={styles.buttonText}>Guardar información</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '40%', // Ajusta este valor según el estado del mapa
    },
    formContainer: {
        padding: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    introText: {
        fontSize: 14,
        marginBottom: 20,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityPicker: {
        height: 50,
        width: '30%',
        marginLeft: 10,
    },
});

export default Maps;
