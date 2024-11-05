import { supabase } from '../lib/supabase';

export const sendMessage = async (messageContent, senderId, receiverId) => {
    const { data, error } = await supabase
        .from('messages')
        .insert([{ content: messageContent, sender_id: senderId, receiver_id: receiverId }]);

    if (error) {
        console.error('Error sending message:', error);
    } else {
        console.log('Message sent successfully:', data);
    }
};

export const fetchChatMessages = async (user, contact, setMessages) => {
    if (contact) {
        try {
            const fetchedMessages = await fetchMessages(user.id, contact.id);
            setMessages(fetchedMessages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    } else {
        console.error("No contact selected for fetching messages.");
    }
};



export const fetchMessages = async (senderId, receiverId) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${senderId},receiver_id.eq.${receiverId}`)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    console.log('Fetched messages:', data); // Agregado para depuración
    return data;
};


export const subscribeToMessages = (contactId, setMessages) => {
    const messageSubscription = supabase
        .from(`messages:sender_id=eq.${contactId}`)
        .on('INSERT', (payload) => {
            setMessages(prevMessages => [...prevMessages, {
                _id: payload.new.id,
                text: payload.new.content,
                createdAt: new Date(payload.new.created_at),
                user: {
                    _id: payload.new.sender_id,
                    name: payload.new.sender_name, // Asegúrate de que esto esté disponible
                    avatar: payload.new.sender_image, // Asegúrate de que esto esté disponible
                },
            }]);
            console.log('New message received:', payload.new);
        })
        .subscribe();

    return () => {
        supabase.removeSubscription(messageSubscription);
    };
};
export const getSupabaseFileUrl = (path) => {
    return `https://your-supabase-url/storage/v1/object/public/${path}`;
};
