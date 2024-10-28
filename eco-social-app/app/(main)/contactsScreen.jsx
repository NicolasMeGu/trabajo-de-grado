import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { fetchContacts, fetchChatByUsers } from '../../services/userService';
import { supabase } from '../../lib/supabase';
import Header from '../../components/Header';
import Icon from '../../assets/icons';
import { useRouter } from 'expo-router';

const ContactScreen = () => {
    const router = useRouter();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);

    const handleContactSelect = (contact) => {
        setSelectedContact(contact);
        router.push({
            pathname: '/chat',
            params: { contact }
        });
    };


    // URL de la imagen predeterminada
    const defaultImage = 'https://example.com/default-avatar.png'; // Reemplaza con tu URL de imagen predeterminada

    useEffect(() => {
        const getContacts = async () => {
            console.log("Fetching contacts...");

            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.log("Error getting user:", error);
                return;
            }

            const userId = user ? user.id : null;
            if (userId) {
                const contactList = await fetchContacts(userId);
                console.log("Fetched contact list:", contactList);

                // Reemplazar cualquier imagen vacía con la imagen predeterminada
                const updatedContactList = contactList.map(contact => ({
                    ...contact,
                    image: contact.image || defaultImage,
                }));

                setContacts(updatedContactList);
            } else {
                console.log("No user is authenticated");
            }
        };

        getContacts();
    }, []);

   const handleContactPress = async (contact) => {
    console.log("Selected contact:", contact);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const userId = user ? user.id : null;

    if (userError || !userId) {
        console.error("Error getting user:", userError);
        return;
    }

    // Busca un chat existente con el contacto
    const chat = await fetchChatByUsers(userId, contact.id); // Pasamos ambos IDs

    if (chat) {
        console.log("Chat found, navigating...");
        router.push({
            pathname: '/chat',
            params: { contact }
        });
    } else {
        console.log("No chat found, creating a new chat...");
        
        const { error: createChatError } = await supabase
            .from('chats')
            .insert([
                { user_id_1: userId, user_id_2: contact.id }
            ]);

        if (createChatError) {
            console.error("Error creating chat:", createChatError);
        } else {
            // Obtener el chat recién creado
            const newChat = await fetchChatByUsers(userId, contact.id); // Asegúrate de que esta función esté usando los nombres correctos de las columnas.
            router.push({
                pathname: '/chat',
                params: { contact: newChat }
            });
        }
    }
};






    return (
        <View style={styles.container}>
            <Header title="Contactos" />

            <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.contact} onPress={() => handleContactPress(item)}>
                        <Image source={{ uri: item.image }} style={styles.avatar} />
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactName}>{item.name}</Text>
                            <Text style={styles.lastMessage}>Last message preview...</Text>
                        </View>
                        <Icon name="right" type="feather" size={24} color="#888" />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyMessage}>No contacts available.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        padding: 20,
    },
    contact: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginVertical: 5,
        elevation: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    lastMessage: {
        fontSize: 14,
        color: '#888888',
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#888888',
        fontSize: 16,
        marginTop: 20,
    },
});

export default ContactScreen;
