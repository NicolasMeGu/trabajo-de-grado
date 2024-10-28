import { supabase } from "../lib/supabase";

export const getUserData = async ( userId)=>{
    try{
        const {data, error} = await supabase
        .from('users')
        .select()
        .eq('id', userId)
        .single();

        if(error){
            return{success: false, msg: error?.message};
        }
        return{success: true, data};
    }catch(error){
        console.log('got error user service ', error );
        return {success: false, msg: error.message};
    }
}
export const updateUser = async ( userId,data)=>{
    try{
        const {error} = await supabase
        .from('users')
        .update(data)
        .eq('id', userId);
        

        if(error){
            return{success: false, msg: error?.message};
        }
        return{success: true, data};
        

    }catch(error){
        console.log('got error user service ', error );
        return {success: false, msg: error.message};
    }
}
// userService.js
// userService.js
export const fetchContacts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, image')
      .neq('id', userId) // Excluir al usuario autenticado
      .limit(15); // Limitar a 15 usuarios

    if (error) {
      console.error('Error fetching contacts:', error);
      return []; // Retorna un arreglo vacío en caso de error
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching contacts:', error);
    return [];
  }
};

export const fetchChatByUsers = async (userId) => {
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .single(); // Usa .single() si esperas un solo chat

    if (error) {
        console.error("Error fetching chat:", error);
        return null;
    }
    return data;
};

