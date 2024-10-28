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