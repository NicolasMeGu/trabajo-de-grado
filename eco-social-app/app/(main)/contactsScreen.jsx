import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { fetchContacts, fetchChatByUsers } from '../../services/userService';
import { supabase } from '../../lib/supabase'; // Asegúrate de que esto sea correcto
import Header from '../../components/Header';
import Icon from '../../assets/icons';
import { useRouter } from 'expo-router';
import { hp } from '../../helpers/common';
import { theme } from '../../constants/theme';

const ContactScreen = () => {
    const router = useRouter();
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [search, setSearch] = useState('');

    const defaultImage = 'https://example.com/default-avatar.png';

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
                try {
                    const contactList = await fetchContacts(userId); // Asegúrate de que esto esté definido en userService

                    // Validar que contactList sea un arreglo
                    if (Array.isArray(contactList)) {
                        const updatedContactList = contactList.map(contact => ({
                            ...contact,
                            image: contact.image || defaultImage,
                        }));

                        setContacts(updatedContactList);
                        setFilteredContacts(updatedContactList); // Inicialmente muestra todos los contactos
                    } else {
                        console.error("Invalid contacts data:", contactList);
                    }
                } catch (error) {
                    console.error("Error fetching contacts:", error);
                }
            } else {
                console.log("No user is authenticated");
            }
        };

        getContacts();
    }, []);

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredContacts(contacts);
        } else {
            const filtered = contacts.filter(contact =>
                contact.name.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredContacts(filtered);
        }
    }, [search, contacts]);

    const handleContactPress = async (contact) => {
        console.log("Selected contact:", contact);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        const userId = user ? user.id : null;

        if (userError || !userId) {
            console.error("Error getting user:", userError);
            return;
        }

        const chat = await fetchChatByUsers(userId, contact.id);

        if (chat) {
            router.push({
                pathname: '/chat',
                params: { contact: contact }
            });
        } else {
            const { error: createChatError } = await supabase
                .from('chats')
                .insert([
                    { user_id_1: userId, user_id_2: contact.id }
                ]);

            if (createChatError) {
                console.error("Error creating chat:", createChatError);
            } else {
                const newChat = await fetchChatByUsers(userId, contact.id);
                router.push({
                    pathname: '/chat',
                    params: { contact }
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Contactos" />
            <View style={styles.header}>
                <Icon name="search" size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar contactos..."
                    value={search}
                    onChangeText={(text) => setSearch(text)}
                />
            </View>
            <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id || item.name}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.contact} onPress={() => handleContactPress(item)}>
                        <Image source={{ uri: item.image || defaultImage }} style={styles.avatar} resizeMode="cover" />
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
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        padding: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
    },
    contact: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    contactInfo: {
        flex: 1,
        marginLeft: 10,
    },
    contactName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    lastMessage: {
        color: '#888',
    },
    emptyMessage: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
});

export default ContactScreen;
