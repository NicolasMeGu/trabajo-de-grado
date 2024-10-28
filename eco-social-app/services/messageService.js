// messageService.js
import { supabase } from '../lib/supabase';

export const fetchMessages = async (contactId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`senderId.eq.${supabase.auth.user().id},receiverId.eq.${contactId}`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(message => ({
      _id: message.id,
      text: message.content,
      createdAt: new Date(message.created_at),
      user: {
        _id: message.senderId,
        name: message.senderName, // Asegúrate de tener el nombre del usuario
      },
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const saveMessage = async (message) => {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        content: message.text,
        senderId: message.user._id,
        receiverId: message.receiverId, // Agrega el ID del receptor
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving message:', error);
  }
};
