import { supabase } from '../../lib/supabaseClient';

export default async function getData() {
    const { data, error } = await supabase
      .from('data')
      .select('*');
      if (error) {
        return error.message
      }
      
      return json({ data });
    }