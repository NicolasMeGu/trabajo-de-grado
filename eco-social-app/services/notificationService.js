import { supabase } from "../lib/supabase";

export const createNotification = async (notification) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert(notification)
            .select()
            .single();

        if (error) {
            console.log('notification error: ', error);
            return { success: false, msg: 'notificaciones error' };
        }
        return { success: true, data: data };
    } catch (error) {
        console.log('notification error: ', error);
        return { succes: false, msg: 'notificaciones error ' };
    }
}
export const fetchNotifications = async (receiverId) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                sender: senderId(id,name,image)
            `)
            .eq('receiverId', receiverId)  // Cambiado de .id a .eq para filtrar por id
            .order("created_at", { ascending: false, foreingTable: 'comments' })
           

        if (error) {
            console.log('fetchNotifications error: ', error);
            return { success: false, msg: 'Could not fetch the notification' };
        }

        return { success: true, data: data };
    } catch (error) {
        console.log('fetchNotifications error: ', error);
        return { success: false, msg: 'Could not fetch the notification' };
    }
}
// services/notificationService.js

export const sendNotification = async (userId, message) => {
    try {
        const response = await fetch('https://tu-api.com/notificaciones', {
            method: 'POST', // Verifica que POST sea el método correcto
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                message,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error al enviar notificación:', error.message);
        return { success: false, error: error.message };
    }
};



export const getNotifications = async () => {
    let res = await fetchNotifications(user.id);
    console.log('notifications ', res);
    if(res.success) setNotifications(res.data);
}
