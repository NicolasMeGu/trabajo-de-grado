// userService.js

import { supabase } from '../lib/supabase';

export const fetchContacts = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, image')
    .neq('id', userId); // Filtra el usuario actual

  if (error) {
    console.error('Error fetching contacts:', error);
    return []; // Retorna un arreglo vacío en caso de error
  }

  return data; // Retorna la lista de contactos
};
