import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { fetchMessages, sendMessage, subscribeToMessages } from '../../services/chatServices'; // Asegúrate de importar tus funciones correctamente

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [contact, setContact] = useState(null);

    useEffect(() => {
        const fetchContacts = async () => {
            // ... tu lógica para obtener contactos
        };

        fetchContacts();
    }, []);

    const loadMessages = async (contactId) => {
        const fetchedMessages = await fetchMessages(contactId); 
        const formattedMessages = fetchedMessages.map(msg => ({
            _id: msg.id,
            text: msg.content, // Asegúrate de que esto se corresponda con tu estructura de datos
            createdAt: new Date(msg.created_at), // Cambia según tu esquema
            user: {
                _id: msg.sender_id, // Cambia según tu esquema
                name: msg.sender_name, // Cambia según tu esquema
                avatar: msg.sender_image, // Cambia según tu esquema
            },
        }));
        setMessages(formattedMessages);
    };

    useEffect(() => {
        if (contact) {
            loadMessages(contact.id); // Carga mensajes al seleccionar un contacto

            const unsubscribe = subscribeToMessages(contact.id, setMessages); // Suscripción a mensajes en tiempo real

            return () => unsubscribe(); // Desuscribirse al desmontar el componente
        }
    }, [contact]);

    const onSend = useCallback(async (messages = []) => {
        if (!contact) {
            console.error("No contact selected");
            return;
        }

        const { text } = messages[0];
        const userId = 1; // Cambia esto por el ID real del usuario
        const receiverId = contact.id;

        // Enviar el mensaje a la base de datos
        await sendMessage(text, userId, receiverId);

        // Actualiza la UI
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messages),
        );
    }, [contact]);

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{ _id: 1 }} // Cambia esto por el ID real del usuario
                renderAvatar={null}
                placeholder="Escribe un mensaje..."
                style={styles.chatContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    chatContainer: {
        backgroundColor: '#F0F0F0',
    },
});

export default ChatScreen;
