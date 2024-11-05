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
import { Modal } from 'react-native';
import { sendNotification,getNotifications, createNotification } from '../../services/notificationService'; // Importa la función

// Importar imágenes para los marcadores
import appleImage from '../../assets/apple.png'; // Huertos
import meatImage from '../../assets/meat.png';   // Cría de animales
import recyclingImage from '../../assets/recycling.png'; // Reciclaje
import { hp } from '../../helpers/common';

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
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(false);

    

    useEffect(() => {
        getLocationPermission();
        loadUserLocations(); // Esta llamada se realizará solo al montar el componente
    }, []); // El segundo argumento es un array vacío para que se ejecute solo una vez


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
    if (!user?.id || !location?.coords) return; // Verificación antes de actualizar

    const current = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        userId: user.id
    };

    const existingLocation = await fetchLocations();
    const userLocation = existingLocation.data.find(loc => loc.userId === user.id);
    
    if (!userLocation) {
        // Solo crea una nueva ubicación si no existe ya
        const res = await createOrUpdateLocation(current);
        if (!res.success) Alert.alert('Error', res.msg);
    }
    setOrigin(current); // Mantenemos la ubicación actual configurada
};
    const handleLocationUpdate = async (newLocation, formData) => {
        const existingData = await fetchDataFromDatabase(newLocation); // Función para verificar si ya existe un dato

        if (existingData) {
            // Actualiza solo los campos necesarios
            await updateDataInDatabase(existingData.id, {
                ...existingData,
                ...formData, // Mezcla los datos del formulario
                location: newLocation, // Actualiza la ubicación
            });
        } else {
            // Crea un nuevo registro
            await addDataToDatabase({
                ...formData,
                location: newLocation,
            });
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

            setUserLocations(locationsWithNames); // Esto asegura que solo se configure una vez
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
        setSelectedLocation(location);
        setModalVisible(true);
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
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{selectedLocation?.userName}</Text>
                        <Text>{`Proyecto: ${selectedLocation?.projectType}`}</Text>
                        <Text>{`Producción: ${selectedLocation?.producedItems}`}</Text>
                        <Text>{`Cantidad: ${selectedLocation?.producedQuantity} ${selectedLocation?.quantityUnit || ''}`}</Text>
                        <Text>{`Opción: ${selectedLocation?.sellingOption}`}</Text>
                        <Text>{`Precio: ${selectedLocation?.sellingPrice || 'N/A'}`}</Text>
                     <TouchableOpacity 
            onPress={async () => {
                // Asegúrate de que el ID del receptor esté disponible
                if (!user.id) {
                    console.error('Error: El ID del usuario es necesario para enviar la notificación.');
                    return;
                }

                let notify = {
                    senderId: user.id, // ID del usuario que envía la notificación
                    receiverId: selectedLocation?.userId, // Asegúrate de que este ID corresponda al usuario en el modal
                    title: 'alguien quiere interactuar contigo',
                    data: JSON.stringify({ projectType: selectedLocation?.projectType }) // Agrega más datos si es necesario
                };

                try {
                    await createNotification(notify); // Llama a la función para enviar la notificación
                    console.log('Notificación enviada exitosamente');
                } catch (error) {
                    console.error('Error al enviar la notificación:', error);
                }
            }}
        >
            <Text style={styles.closeButton}>interactuar</Text>
        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButton}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>


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
                                            <Picker.Item label="cajas" value="cajas" />
                                            <Picker.Item label="litros" value="litros" />
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

                            <TouchableOpacity style={styles.button}>

                                <Button
                                    buttonStyle={{ height: hp(6.2) }}
                                    title="Guardar información"
                                    loading={loading}
                                    hasShadow={false}
                                    onPress={handleSubmit}
                                />

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
        padding: 10,
        backgroundColor: '#f8f8f8', // Cambia el fondo si lo deseas
    },
    map: {
        width: '100%',
        borderRadius: 10, // Añade bordes redondeados
        overflow: 'hidden', // Asegúrate de que los bordes redondeados funcionen
        elevation: 5, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10, // Bordes redondeados
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
    },
    introText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#666',
    },
    formContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        backgroundColor: '#f9f9f9',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    quantityPicker: {
        width: 100,
    },
    picker: {
        height: 50,
        marginVertical: 10,
    },
    closeButton: {
        color: '#007BFF',
        textAlign: 'center',
        marginTop: 20,
        fontWeight: 'bold',
    },
});


export default Maps;
