import { supabase } from "../lib/supabase";


// Crear o actualizar la ubicación de un usuario en la base de datos
export const createOrUpdateLocation = async (location) => {
    try {
        const { data, error } = await supabase
            .from('user_locations')
            .upsert(location)
            .select()
            .single();

        if (error) {
            console.log('Location error: ', error);
            return { success: false, msg: 'No se pudo actualizar la ubicación' };
        }
        return { success: true, data };
    } catch (error) {
        console.log('Location error: ', error);
        return { success: false, msg: 'No se pudo actualizar la ubicación' };
    }
};

// Obtener todas las ubicaciones de los usuarios
export const fetchLocations = async () => {
    try {
        const { data, error } = await supabase
            .from('user_locations')
            .select(`
                *,
                user: users (id, name, image)
            `);

        if (error) {
            console.log('fetchLocations error: ', error);
            return { success: false, msg: 'No se pudieron obtener las ubicaciones' };
        }

        return { success: true, data };
    } catch (error) {
        console.log('fetchLocations error: ', error);
        return { success: false, msg: 'No se pudieron obtener las ubicaciones' };
    }
};
